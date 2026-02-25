import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(20),
        email: z.string().email(),
        password: z.string().min(6),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
});

export const logoutSchema = z.object({
    body: z.object({
        userId: z.string(),
    }),
});
