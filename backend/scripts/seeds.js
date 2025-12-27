const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Create default users if they don't exist
    const usersExist = await db.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(usersExist.rows[0].count) === 0) {
      console.log('Creating default users...');
      
      // Hash passwords
      const salt = await bcrypt.genSalt(10);
      const managerPassword = await bcrypt.hash('Manager@123', salt);
      const storePassword = await bcrypt.hash('Store@123', salt);
      const clerkPassword = await bcrypt.hash('Clerk@123', salt);

      // Insert default users
      await db.query(
        `INSERT INTO users 
         (username, email, password_hash, role, first_name, last_name, phone, language_preference)
         VALUES 
         ('manager', 'manager@preferred.rw', $1, 'manager', 'John', 'Manager', '+250788111111', 'en'),
         ('store_manager', 'store@preferred.rw', $2, 'store_manager', 'Jane', 'Store', '+250788222222', 'en'),
         ('attendance_clerk', 'clerk@preferred.rw', $3, 'attendance_clerk', 'Bob', 'Clerk', '+250788333333', 'rw')`,
        [managerPassword, storePassword, clerkPassword]
      );

      console.log('Default users created successfully');
    }

    // Create sample employees
    const employeesExist = await db.query('SELECT COUNT(*) FROM employees');
    
    if (parseInt(employeesExist.rows[0].count) === 0) {
      console.log('Creating sample employees...');
      
      const manager = await db.query("SELECT id FROM users WHERE username = 'manager'");
      const managerId = manager.rows[0].id;

      const sampleEmployees = [
        ['EMP-0001', 'James', 'Smith', '+250788444444', 'Foreman', 25000, '2023-01-15'],
        ['EMP-0002', 'Mary', 'Johnson', '+250788555555', 'Carpenter', 20000, '2023-02-20'],
        ['EMP-0003', 'Robert', 'Williams', '+250788666666', 'Electrician', 22000, '2023-03-10'],
        ['EMP-0004', 'Patricia', 'Brown', '+250788777777', 'Plumber', 21000, '2023-04-05'],
        ['EMP-0005', 'Michael', 'Jones', '+250788888888', 'Laborer', 15000, '2023-05-12']
      ];

      for (const emp of sampleEmployees) {
        await db.query(
          `INSERT INTO employees 
           (employee_code, first_name, last_name, phone, position, rate_per_day, hire_date, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [...emp, managerId]
        );
      }

      console.log('Sample employees created successfully');
    }

    // Create sample materials
    const materialsExist = await db.query('SELECT COUNT(*) FROM materials');
    
    if (parseInt(materialsExist.rows[0].count) === 0) {
      console.log('Creating sample materials...');
      
      const storeManager = await db.query("SELECT id FROM users WHERE username = 'store_manager'");
      const storeManagerId = storeManager.rows[0].id;

      const sampleMaterials = [
        ['CON-0001', 'Cement 50kg', 'Construction', 'bags', 100, 20, 12000, 'Rwanda Cement', 'Warehouse A', 'Portland cement'],
        ['CON-0002', 'Steel Bars 12mm', 'Construction', 'pieces', 500, 50, 15000, 'Steel Corp', 'Warehouse B', 'Rebar for construction'],
        ['CON-0003', 'Sand', 'Construction', 'cubic meters', 50, 10, 20000, 'Local Supplier', 'Yard', 'Construction sand'],
        ['ELC-0001', 'Electrical Wires', 'Electrical', 'rolls', 30, 5, 35000, 'Electric Co', 'Store Room', '2.5mm electrical wires'],
        ['PLB-0001', 'PVC Pipes 4"', 'Plumbing', 'pieces', 200, 30, 8000, 'Pipe Manufacturer', 'Warehouse C', 'PVC pipes for plumbing']
      ];

      for (const mat of sampleMaterials) {
        await db.query(
          `INSERT INTO materials 
           (item_code, item_name, category, unit, quantity, reorder_level, 
            unit_price, supplier, location, description, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [...mat, storeManagerId]
        );
      }

      console.log('Sample materials created successfully');
    }

    // Create sample attendance records for the current month
    const attendanceExist = await db.query('SELECT COUNT(*) FROM attendance');
    
    if (parseInt(attendanceExist.rows[0].count) === 0) {
      console.log('Creating sample attendance records...');
      
      const clerk = await db.query("SELECT id FROM users WHERE username = 'attendance_clerk'");
      const clerkId = clerk.rows[0].id;

      const employees = await db.query('SELECT id FROM employees LIMIT 5');
      
      // Create attendance for last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        for (const employee of employees.rows) {
          const status = Math.random() > 0.1 ? 'present' : 'absent';
          const hoursWorked = status === 'present' ? 8 : 0;

          await db.query(
            `INSERT INTO attendance 
             (employee_id, attendance_date, hours_worked, status, recorded_by)
             VALUES ($1, $2, $3, $4, $5)`,
            [employee.id, dateStr, hoursWorked, status, clerkId]
          );
        }
      }

      console.log('Sample attendance records created successfully');
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();