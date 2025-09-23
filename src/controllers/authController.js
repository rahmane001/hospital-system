const User = require('../models/User');
const jwt = require('jsonwebtoken');



const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};


exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        
        if (role === 'admin') {
            return res.status(403).json({ message: 'Cannot register as admin directly' });
        }

        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ message: 'User already exists' });

        const user = new User({
            name,
            email,
            password,
            role: role === 'doctor' ? 'doctor' : 'patient',
            doctorStatus: role === 'doctor' ? 'pending' : 'approved'
        });

        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            doctorStatus: user.doctorStatus,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.role === 'doctor' && user.doctorStatus !== 'approved') {
            return res.status(403).json({ message: 'Doctor account awaiting admin approval' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            doctorStatus: user.doctorStatus,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
