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
    // Trim any whitespace from hash
    const trimmedHash = hash.trim();
    
    // Check if hash looks like a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (!trimmedHash.startsWith('$2')) {
      console.error('Password hash does not appear to be a bcrypt hash. Hash length:', trimmedHash.length, 'First 20 chars:', trimmedHash.substring(0, 20));
      return false;
    }
    
    const result = await bcrypt.compare(password, trimmedHash);
    console.log('Bcrypt compare result:', result, 'for hash starting with:', trimmedHash.substring(0, 10));
    return result;
  } catch (error) {
    console.error('Error comparing password:', error.message);
    return false;
  }
};

