import { z } from "zod";

export const createRoomSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(50),
        ownerId: z.string().uuid(),
    }),
});

export const deleteRoomSchema = z.object({
    body: z.object({
        name: z.string(),
        ownerId: z.string().uuid(),
    }),
});

export const getRoomSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const joinRoomSchema = z.object({
    body: z.object({
        roomId: z.string(),
        userId: z.string(),
    }),
});