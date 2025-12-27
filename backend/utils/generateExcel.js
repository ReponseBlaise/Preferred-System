
// ============================================
// utils/generateExcel.js
// ============================================

const ExcelJS = require('exceljs');

// Generate Payroll Excel Report
exports.generatePayrollExcel = async (data, options) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payroll Report');

        // Set column widths
        worksheet.columns = [
            { header: 'Employee Name', key: 'full_name', width: 25 },
            { header: 'Position', key: 'position', width: 20 },
            { header: 'Rate per Day (RWF)', key: 'rate_per_day', width: 18 },
            { header: 'Days Worked', key: 'days_worked', width: 15 },
            { header: 'Total Hours', key: 'total_hours', width: 15 },
            { header: 'Total Amount (RWF)', key: 'total_amount', width: 20 }
        ];

        // Add title
        worksheet.mergeCells('A1:F1');
        worksheet.getCell('A1').value = 'PREFERRED CONTRACTORS LTD - Payroll Report';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

        // Add period
        worksheet.mergeCells('A2:F2');
        worksheet.getCell('A2').value = `Period: ${options.start_date} to ${options.end_date}`;
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        // Add generated date
        worksheet.mergeCells('A3:F3');
        worksheet.getCell('A3').value = `Generated: ${new Date().toLocaleDateString()}`;
        worksheet.getCell('A3').alignment = { horizontal: 'center' };

        // Add empty row
        worksheet.addRow([]);

        // Style header row
        const headerRow = worksheet.getRow(5);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1e40af' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Add data
        let totalAmount = 0;
        data.forEach((row) => {
            const amount = parseFloat(row.total_amount);
            totalAmount += amount;
            
            worksheet.addRow({
                full_name: row.full_name,
                position: row.position,
                rate_per_day: parseFloat(row.rate_per_day),
                days_worked: parseInt(row.days_worked),
                total_hours: parseFloat(row.total_hours),
                total_amount: amount
            });
        });

        // Add total row
        const totalRow = worksheet.addRow({
            full_name: '',
            position: '',
            rate_per_day: '',
            days_worked: '',
            total_hours: 'TOTAL:',
            total_amount: totalAmount
        });
        totalRow.font = { bold: true };
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFdbeafe' }
        };

        // Format numbers
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 5) {
                row.getCell(3).numFmt = '#,##0.00';
                row.getCell(6).numFmt = '#,##0.00';
            }
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        throw error;
    }
};

// Generate Inventory Excel Report
exports.generateInventoryExcel = async (data) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory Report');

        // Set column widths
        worksheet.columns = [
            { header: 'Category', key: 'category', width: 15 },
            { header: 'Item Name', key: 'item_name', width: 30 },
            { header: 'Description', key: 'description', width: 35 },
            { header: 'Quantity', key: 'quantity', width: 12 },
            { header: 'Unit', key: 'unit', width: 10 },
            { header: 'Unit Price (RWF)', key: 'unit_price', width: 18 },
            { header: 'Total Value (RWF)', key: 'total_value', width: 20 }
        ];

        // Add title
        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A1').value = 'PREFERRED CONTRACTORS LTD - Inventory Report';
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

        // Add generated date
        worksheet.mergeCells('A2:G2');
        worksheet.getCell('A2').value = `Generated: ${new Date().toLocaleDateString()}`;
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        // Add empty row
        worksheet.addRow([]);

        // Style header row
        const headerRow = worksheet.getRow(4);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1e40af' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

        // Add data
        let grandTotal = 0;
        data.forEach((row) => {
            const totalValue = parseFloat(row.total_value);
            grandTotal += totalValue;
            
            worksheet.addRow({
                category: row.category || 'Uncategorized',
                item_name: row.item_name,
                description: row.description,
                quantity: parseFloat(row.quantity),
                unit: row.unit,
                unit_price: parseFloat(row.unit_price),
                total_value: totalValue
            });
        });

        // Add grand total row
        const totalRow = worksheet.addRow({
            category: '',
            item_name: '',
            description: '',
            quantity: '',
            unit: '',
            unit_price: 'GRAND TOTAL:',
            total_value: grandTotal
        });
        totalRow.font = { bold: true };
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFdbeafe' }
        };

        // Format numbers
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 4) {
                row.getCell(4).numFmt = '#,##0.00';
                row.getCell(6).numFmt = '#,##0.00';
                row.getCell(7).numFmt = '#,##0.00';
            }
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        throw error;
    }
};