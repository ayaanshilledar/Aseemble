import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET!) as { userId: string };
};

export const signToken = (payload: any) => {
    return jwt.sign(payload, JWT_SECRET!);
};
