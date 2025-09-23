const User = require('../models/User');

exports.createAdmin = async (req, res) => {
    try {
        
        const provided = req.body.secret || req.headers['x-admin-secret'];
        if (!provided || provided !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ message: 'Invalid admin secret' });
        }

        const { name, email, password } = req.body;
        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ message: 'User already exists' });

        const admin = new User({
            name,
            email,
            password,
            role: 'admin',
            doctorStatus: 'approved'
        });

        await admin.save();

        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
