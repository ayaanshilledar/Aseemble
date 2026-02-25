import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { signToken } from "../../utils/jwt";
// refreshtoken missing
export const register = async ({ username, email, password }: any) => {
  const hash = await bcrypt.hash(password, 10);

  try {
    return await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hash
      }
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new AppError("Email or username already exists", 400);
    }
    throw error;
  }
};

export const login = async ({ email, password }: any) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user.id });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  };
};
export const logout = async ({userId}:{userId:string})=>{
   const user = await prisma.user.findUnique({where:{id:userId}})
   if(!user){
    throw new AppError("User not found", 404);
   }
   await prisma.user.update({
    where:{id:userId},
    data:{
         id: userId
    }
   })
   return user;
}