const bcrypt = require('bcryptjs');

async function genHash(plain) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plain, salt);
        console.log('PLAIN:', plain);
        console.log('HASH:', hash);
    } catch (err) {
        console.error('Error generating hash:', err);
    }
}


const plainPassword = process.argv[2] || '123456';
genHash(plainPassword);
