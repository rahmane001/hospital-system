const User = require('../models/User');


exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

    
        if (req.user.role === 'admin') {
            user.role = req.body.role || user.role;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    };


exports.approveDoctor = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        user.doctorStatus = 'approved';
        await user.save();
        res.json({ message: 'Doctor approved', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

