import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  if (!hash || !password) {
    console.error('Password or hash is missing');
    return false;
  }
  
  try {
    // Check if hash looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (!hash.startsWith('$2')) {
      console.error('Password hash does not appear to be a bcrypt hash:', hash.substring(0, 20));
      return false;
    }
    
    const result = await bcrypt.compare(password, hash);
    return result;
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};

