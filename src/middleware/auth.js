import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header provided' });
        }

        // Check if header starts with 'Bearer '
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Invalid authorization header format. Use: Bearer <token>' });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Ensure decoded is an object and has an id property
        const userId = typeof decoded === 'object' && decoded !== null && 'id' in decoded ? decoded.id : null;
        if (!userId) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        // Get user from database
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Add user to request object
        req.user = {
            id: user._id.toString(),
            // @ts-ignore
            email: user.bussinessemail,
            name: `${user.firstname} ${user.lastname}`,
            company: user.company,
            phone: user.phonenumber,
            avatar: user.avatar,
            branding: user.branding,
            addresses: user.addresses
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Server error during authentication' });
    }
};

// Optional middleware for admin routes
export const verifyAdmin = async (req, res, next) => {
    try {
        // First verify the token
        await verifyToken(req, res, () => { });

        // Check if user has admin privileges
        // You can implement admin role checking here
        // For now, we'll check if user email is in admin list
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

        if (!adminEmails.includes(req.user.email)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({ error: 'Server error during admin verification' });
    }
};

// Middleware to make authentication optional
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                    const userId = typeof decoded === 'object' && decoded !== null && 'id' in decoded ? decoded.id : null;
                    if (userId) {
                        const user = await User.findById(userId).select('-password');
                        if (user) {
                            req.user = {
                                id: user._id.toString(),
                                email: user.bussinessemail,
                                name: `${user.firstname} ${user.lastname}`,
                                company: user.company,
                                phone: user.phonenumber,
                                avatar: user.avatar,
                                branding: user.branding,
                                addresses: user.addresses
                            };
                        }
                    }
                } catch (error) {
                    console.error('Admin verification error:', error);
                    res.status(500).json({ error: 'Server error during admin verification' });
                }
            }
        }
        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({ error: 'Server error during admin verification' });
    }
};