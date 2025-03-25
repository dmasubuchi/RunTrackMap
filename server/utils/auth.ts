import * as bcrypt from 'bcrypt';

/**
 * Hashes a password using bcrypt
 * 
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plain text password with a hashed password
 * 
 * @param plain - Plain text password to compare
 * @param hashed - Hashed password to compare against
 * @returns Promise resolving to boolean indicating if passwords match
 */
export const comparePasswords = async (plain: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};
