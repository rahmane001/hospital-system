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

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

    const updatedUser = await user.save();
    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
    });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
} catch (error) {
    res.status(500).json({ message: error.message });
}
};


exports.deleteUser = async (req, res) => {
try {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    
    if (user.role === "admin") {
        return res.status(403).json({ message: "Cannot delete Admin user" });
    }

    await user.deleteOne(); 
    res.json({ message: "User removed" });

    } catch (error) {
        res.status(500).json({ message: error.message });
}
};

