const db = require('../config/database');

// Generate employee code
exports.generateEmployeeCode = async () => {
  try {
    const result = await db.query(
      "SELECT employee_code FROM employees WHERE employee_code LIKE 'EMP-%' ORDER BY employee_code DESC LIMIT 1"
    );
    
    if (result.rows.length === 0) {
      return 'EMP-0001';
    }
    
    const lastCode = result.rows[0].employee_code;
    const lastNumber = parseInt(lastCode.split('-')[1]);
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    
    return `EMP-${newNumber}`;
  } catch (error) {
    console.error('Error generating employee code:', error);
    // Fallback to timestamp based code
    const timestamp = Date.now().toString().slice(-4);
    return `EMP-${timestamp}`;
  }
};

// Generate item code
exports.generateItemCode = async (category = 'MAT') => {
  try {
    const result = await db.query(
      "SELECT item_code FROM materials WHERE item_code LIKE $1 ORDER BY item_code DESC LIMIT 1",
      [`${category}-%`]
    );
    
    if (result.rows.length === 0) {
      return `${category}-0001`;
    }
    
    const lastCode = result.rows[0].item_code;
    const lastNumber = parseInt(lastCode.split('-')[1]);
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    
    return `${category}-${newNumber}`;
  } catch (error) {
    console.error('Error generating item code:', error);
    const timestamp = Date.now().toString().slice(-4);
    return `${category}-${timestamp}`;
  }
};

// Format currency
exports.formatCurrency = (amount, currency = 'RWF') => {
  return `${currency} ${parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Calculate days between dates
exports.daysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates
};

// Validate date range
exports.validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date');
  }
  
  if (isNaN(end.getTime())) {
    throw new Error('Invalid end date');
  }
  
  if (start > end) {
    throw new Error('Start date cannot be after end date');
  }
  
  if (end > today) {
    throw new Error('End date cannot be in the future');
  }
  
  return true;
};

// Format date for display
exports.formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format datetime for display
exports.formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Sanitize input
exports.sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove HTML tags and trim whitespace
    return input.replace(/<[^>]*>/g, '').trim();
  }
  return input;
};

// Generate random password
exports.generatePassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

// Validate email format
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Rwanda format)
exports.isValidPhone = (phone) => {
  const phoneRegex = /^\+250\d{9}$|^0\d{9}$/;
  return phoneRegex.test(phone);
};

// Calculate age from date of birth
exports.calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) {
    return null;
  }
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Generate pagination metadata
exports.generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

// Format file size
exports.formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get current date in YYYY-MM-DD format
exports.getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Get current datetime in ISO format
exports.getCurrentDateTime = () => {
  return new Date().toISOString();
};

// Calculate payroll for employee
exports.calculatePayroll = (ratePerDay, daysWorked, deductions = 0) => {
  const grossAmount = ratePerDay * daysWorked;
  const netAmount = grossAmount - deductions;
  
  return {
    grossAmount,
    deductions,
    netAmount
  };
};

// Check if value is numeric
exports.isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Deep clone object
exports.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function
exports.debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
exports.throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};