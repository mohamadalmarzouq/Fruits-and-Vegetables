import prisma from '../config/database.js';
import { hashPassword } from './password.js';

/**
 * Helper script to reset a user's password
 * Usage: 
 *   node -e "import('./src/utils/resetPassword.js').then(m => m.resetUserPassword('user@example.com', 'newpassword123'))"
 */

export const resetUserPassword = async (email, newPassword) => {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('User not found with email:', email);
      return { success: false, error: 'User not found' };
    }

    if (!newPassword || newPassword.length < 6) {
      console.log('Password must be at least 6 characters');
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);
    console.log('New password hash created, starts with:', passwordHash.substring(0, 10));

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    console.log('Password updated in database');
    console.log('Updated hash starts with:', updatedUser.passwordHash.substring(0, 10));
    
    // Verify the update by reading back
    const verifyUser = await prisma.user.findUnique({
      where: { email },
      select: { passwordHash: true }
    });
    
    console.log('Verified hash starts with:', verifyUser.passwordHash.substring(0, 10));
    console.log('Hashes match:', passwordHash === verifyUser.passwordHash);
    
    console.log('Password reset successfully for:', email);
    console.log('User role:', user.role);
    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: error.message };
  } finally {
    await prisma.$disconnect();
  }
};

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.log('Usage: node resetPassword.js <email> <newPassword>');
    process.exit(1);
  }
  
  resetUserPassword(email, password).then(() => {
    process.exit(0);
  });
}

