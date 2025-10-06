export const bcryptPasswordCompare = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const bcrypt = await import("bcryptjs");
  return await bcrypt.compare(password, hashedPassword);
};

export const bcryptPasswordHash = async (password: string): Promise<string> => {
  const bcrypt = await import("bcryptjs");

  const saltRounds = 10; // You can adjust the salt rounds as needed
  return await bcrypt.hash(password, saltRounds);
};
