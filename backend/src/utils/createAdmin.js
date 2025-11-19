import prisma from '../config/database.js';
import { hashPassword } from './password.js';

/**
 * Helper script to create an admin user
 * Run: node -e "import('./src/utils/createAdmin.js').then(m => m.createAdmin('admin@example.com', 'password123'))"
 */

export const createAdmin = async (email, password) => {
  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('Admin user already exists with this email');
      return;
    }

    const passwordHash = await hashPassword(password);

    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'admin'
      }
    });

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';
  createAdmin(email, password);
}

