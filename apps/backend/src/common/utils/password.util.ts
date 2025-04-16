import { hash, compare, genSalt } from 'bcryptjs';

export const hashPassword = async (plainPassword: string): Promise<string> => {
  const salt = await genSalt(10);
  return await hash(plainPassword, salt);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await compare(plainPassword, hashedPassword);
};
