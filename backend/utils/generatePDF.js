// ============================================
// utils/generatePDF.js
// ============================================

const PDFDocument = require('pdfkit');

// Generate Payroll PDF Report
exports.generatePayrollPDF = async (data, options) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(20).font('Helvetica-Bold')
                .text('PREFERRED CONTRACTORS LTD', { align: 'center' });
            
            doc.fontSize(16).font('Helvetica-Bold')
                .text('Payroll Report', { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(10).font('Helvetica')
                .text(`Period: ${options.start_date} to ${options.end_date}`, { align: 'center' })
                .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })
                .moveDown(1);

            // Table Header
            const startY = doc.y;
            const tableTop = startY;
            const colWidth = [150, 100, 80, 70, 90, 110];
            const headers = ['Employee Name', 'Position', 'Rate/Day', 'Days', 'Hours', 'Total Amount'];

            doc.fontSize(9).font('Helvetica-Bold');
            let xPos = 50;
            headers.forEach((header, i) => {
                doc.text(header, xPos, tableTop, { width: colWidth[i], align: 'left' });
                xPos += colWidth[i];
            });

            // Draw header line
            doc.moveTo(50, tableTop + 15)
                .lineTo(550, tableTop + 15)
                .stroke();

            // Table Content
            doc.font('Helvetica').fontSize(8);
            let yPos = tableTop + 20;
            let totalAmount = 0;

            data.forEach((row) => {
                if (yPos > 700) {
                    doc.addPage();
                    yPos = 50;
                }

                xPos = 50;
                doc.text(row.full_name, xPos, yPos, { width: colWidth[0], align: 'left' });
                xPos += colWidth[0];
                
                doc.text(row.position, xPos, yPos, { width: colWidth[1], align: 'left' });
                xPos += colWidth[1];
                
                doc.text(`${parseFloat(row.rate_per_day).toLocaleString()} RWF`, xPos, yPos, { width: colWidth[2], align: 'right' });
                xPos += colWidth[2];
                
                doc.text(row.days_worked, xPos, yPos, { width: colWidth[3], align: 'center' });
                xPos += colWidth[3];
                
                doc.text(parseFloat(row.total_hours).toFixed(2), xPos, yPos, { width: colWidth[4], align: 'center' });
                xPos += colWidth[4];
                
                const amount = parseFloat(row.total_amount);
                totalAmount += amount;
                doc.text(`${amount.toLocaleString()} RWF`, xPos, yPos, { width: colWidth[5], align: 'right' });
                
                yPos += 20;
            });

            // Draw footer line
            doc.moveTo(50, yPos)
                .lineTo(550, yPos)
                .stroke();

            // Total
            yPos += 10;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('TOTAL PAYROLL:', 350, yPos, { width: 90, align: 'right' });
            doc.text(`${totalAmount.toLocaleString()} RWF`, 440, yPos, { width: 110, align: 'right' });

            // Footer
            doc.fontSize(8).font('Helvetica')
                .text('Contact: +250 788 217 389 | Email: info@preferred.rw', 50, 750, 
                    { align: 'center', width: 500 });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

// Generate Inventory PDF Report
exports.generateInventoryPDF = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(20).font('Helvetica-Bold')
                .text('PREFERRED CONTRACTORS LTD', { align: 'center' });
            
            doc.fontSize(16).font('Helvetica-Bold')
                .text('Inventory Report', { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(10).font('Helvetica')
                .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })
                .moveDown(1);

            // Table Header
            const startY = doc.y;
            const tableTop = startY;
            const colWidth = [200, 70, 60, 90, 120];
            const headers = ['Item Name', 'Quantity', 'Unit', 'Unit Price', 'Total Value'];

            doc.fontSize(9).font('Helvetica-Bold');
            let xPos = 50;
            headers.forEach((header, i) => {
                doc.text(header, xPos, tableTop, { width: colWidth[i], align: 'left' });
                xPos += colWidth[i];
            });

            // Draw header line
            doc.moveTo(50, tableTop + 15)
                .lineTo(540, tableTop + 15)
                .stroke();

            // Group by category
            const groupedData = data.reduce((acc, item) => {
                const category = item.category || 'Uncategorized';
                if (!acc[category]) acc[category] = [];
                acc[category].push(item);
                return acc;
            }, {});

            doc.font('Helvetica').fontSize(8);
            let yPos = tableTop + 20;
            let grandTotal = 0;

            Object.keys(groupedData).forEach(category => {
                if (yPos > 700) {
                    doc.addPage();
                    yPos = 50;
                }

                // Category Header
                doc.fontSize(9).font('Helvetica-Bold');
                doc.text(category.toUpperCase(), 50, yPos);
                yPos += 20;

                doc.fontSize(8).font('Helvetica');
                groupedData[category].forEach(row => {
                    if (yPos > 700) {
                        doc.addPage();
                        yPos = 50;
                    }

                    xPos = 50;
                    doc.text(row.item_name, xPos, yPos, { width: colWidth[0], align: 'left' });
                    xPos += colWidth[0];
                    
                    doc.text(parseFloat(row.quantity).toFixed(2), xPos, yPos, { width: colWidth[1], align: 'right' });
                    xPos += colWidth[1];
                    
                    doc.text(row.unit, xPos, yPos, { width: colWidth[2], align: 'center' });
                    xPos += colWidth[2];
                    
                    doc.text(`${parseFloat(row.unit_price).toLocaleString()} RWF`, xPos, yPos, { width: colWidth[3], align: 'right' });
                    xPos += colWidth[3];
                    
                    const totalValue = parseFloat(row.total_value);
                    grandTotal += totalValue;
                    doc.text(`${totalValue.toLocaleString()} RWF`, xPos, yPos, { width: colWidth[4], align: 'right' });
                    
                    yPos += 18;
                });

                yPos += 10;
            });

            // Draw footer line
            doc.moveTo(50, yPos)
                .lineTo(540, yPos)
                .stroke();

            // Grand Total
            yPos += 10;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('TOTAL INVENTORY VALUE:', 320, yPos, { width: 100, align: 'right' });
            doc.text(`${grandTotal.toLocaleString()} RWF`, 420, yPos, { width: 120, align: 'right' });

            // Footer
            doc.fontSize(8).font('Helvetica')
                .text('Contact: +250 788 217 389 | Email: info@preferred.rw', 50, 750, 
                    { align: 'center', width: 490 });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};


