const bcrypt = require('bcryptjs');

async function setup() {
    const passwords = {
        'manager@preferred.rw': 'admin123',
        'employee@preferred.rw': 'employee123',
        'store@preferred.rw': 'store123'
    };
    
    console.log('-- Password Hashes for preferreddb --\n');
    
    for (const [email, password] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 10);
        console.log(`UPDATE users SET password = '${hash}' WHERE email = '${email}';`);
    }
}

setup();