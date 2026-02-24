import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";

export const register = async ({ username, email, password }: any) => {
  const hash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: { username, email, password: hash }
  });
};

export const login = async ({ email, password }: any) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid password");

  const token = jwt.sign({ userId: user.id }, "secret");

  return { token, userId: user.id };
};