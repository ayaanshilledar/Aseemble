import { z } from "zod";

export const createRoomSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(50),
        ownerId: z.string().uuid(),
    }),
});
