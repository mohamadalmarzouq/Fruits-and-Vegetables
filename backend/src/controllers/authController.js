import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const registerVendor = async (req, res, next) => {
  try {
    const { email, password, phoneNumber } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create vendor user (status: pending)
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'vendor',
        vendorStatus: 'pending',
        phoneNumber: phoneNumber || null,
        notificationPreference: 'sms' // Default to SMS
      },
      select: {
        id: true,
        email: true,
        role: true,
        vendorStatus: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Vendor registration successful. Waiting for admin approval.',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // For vendors, check if approved
    if (user.role === 'vendor' && user.vendorStatus !== 'approved') {
      return res.status(403).json({ 
        error: 'Your vendor account is pending approval',
        status: user.vendorStatus 
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        vendorStatus: user.vendorStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

export const registerBuyer = async (req, res, next) => {
  try {
    const { email, password, buyerType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!buyerType || !['individual', 'organization'].includes(buyerType)) {
      return res.status(400).json({ error: 'Buyer type is required (individual or organization)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create buyer user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'buyer',
        buyerType
      },
      select: {
        id: true,
        email: true,
        role: true,
        buyerType: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Buyer registration successful',
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        vendorStatus: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

