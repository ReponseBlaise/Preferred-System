const Enquiry = require('../models/Enquiry');
const db = require('../config/database');

// Create enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const { to_user, subject, message } = req.body;

    // Find manager
    const managerResult = await db.query(
      "SELECT id FROM users WHERE role = 'manager' LIMIT 1"
    );

    if (managerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const enquiryData = {
      from_user: req.user.id,
      to_user: to_user || managerResult.rows[0].id,
      subject,
      message,
      attachment_url: req.file ? `/uploads/${req.file.filename}` : null
    };

    const enquiry = await Enquiry.create(enquiryData);

    // Create notification for manager
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, 'New Enquiry', 
              CONCAT('You have a new enquiry from ', $2, ': ', $3), 'enquiry')`,
      [enquiry.to_user, req.user.first_name, enquiry.subject]
    );

    res.status(201).json({
      success: true,
      data: enquiry,
      message: 'Enquiry sent successfully'
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ error: 'Failed to create enquiry' });
  }
};

// Get user enquiries
exports.getUserEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findByUser(req.user.id, req.user.role);

    res.json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};

// Respond to enquiry
exports.respondToEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const enquiry = await Enquiry.respond(id, response, req.user.id);

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found or unauthorized' });
    }

    res.json({
      success: true,
      data: enquiry,
      message: 'Response sent successfully'
    });
  } catch (error) {
    console.error('Error responding to enquiry:', error);
    res.status(500).json({ error: 'Failed to respond to enquiry' });
  }
};

// Update enquiry status
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const enquiry = await Enquiry.updateStatus(id, status);

    res.json({
      success: true,
      data: enquiry,
      message: 'Enquiry status updated'
    });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    res.status(500).json({ error: 'Failed to update enquiry status' });
  }
};

// Get enquiry by ID
exports.getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }

    // Check permissions
    if (enquiry.from_user !== req.user.id && enquiry.to_user !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({ error: 'Failed to fetch enquiry' });
  }
};

// Get pending enquiries count
exports.getPendingCount = async (req, res) => {
  try {
    const count = await Enquiry.getPendingCount(req.user.id);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching pending count:', error);
    res.status(500).json({ error: 'Failed to fetch pending count' });
  }
};