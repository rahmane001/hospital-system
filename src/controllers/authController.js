const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Web3 = require('web3');
const web3 = new Web3();
const logAudit = require('../middleware/auditMiddleware');



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

        const allowedRoles = ['doctor', 'patient', 'receptionist'];
        const assignedRole = allowedRoles.includes(role) ? role : 'patient';

        const user = new User({
            name,
            email,
            password,
            role: assignedRole,
            doctorStatus: assignedRole === 'doctor' ? 'pending' : 'approved'
        });

        await user.save();
        await logAudit(req, 'register', 'user', user._id.toString(), `New ${assignedRole} registered: ${user.email}`);

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

        await logAudit(req, 'login', 'user', user._id.toString(), `${user.role} logged in: ${user.email}`);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            doctorStatus: user.doctorStatus,
            walletAddress: user.walletAddress,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Link MetaMask wallet to current user account
exports.linkWallet = async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) return res.status(400).json({ message: 'Wallet address is required' });

        // Check if wallet is already linked to another user
        const existing = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (existing && existing._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: 'This wallet is already linked to another account' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { walletAddress: walletAddress.toLowerCase() },
            { new: true }
        ).select('-password');

        await logAudit(req, 'link_wallet', 'user', req.user._id.toString(), `Wallet ${walletAddress} linked`);
        res.json({ message: 'Wallet linked successfully', walletAddress: user.walletAddress });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Sign in with MetaMask wallet (no password needed)
exports.walletLogin = async (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;
        if (!walletAddress || !signature || !message) {
            return res.status(400).json({ message: 'Wallet address, signature, and message are required' });
        }

        // Verify the signature matches the wallet address
        const recoveredAddress = web3.eth.accounts.recover(message, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(401).json({ message: 'Signature verification failed' });
        }

        // Find user by wallet address
        const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'No account linked to this wallet. Please login with email first and link your wallet.' });
        }

        if (user.role === 'doctor' && user.doctorStatus !== 'approved') {
            return res.status(403).json({ message: 'Doctor account awaiting admin approval' });
        }

        await logAudit(req, 'wallet_login', 'user', user._id.toString(), `${user.role} wallet login: ${walletAddress}`);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            doctorStatus: user.doctorStatus,
            walletAddress: user.walletAddress,
            token: generateToken(user._id)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
