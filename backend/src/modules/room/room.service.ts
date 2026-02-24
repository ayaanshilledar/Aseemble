import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

export const createRoom = async ({ name, ownerId }: { name: string; ownerId: string }) => {
    // Verify owner exists
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) {
        throw new AppError("Owner not found", 404);
    }

    return prisma.$transaction(async (tx) => {
        const room = await tx.room.create({
            data: {
                name,
                ownerId,
            },
        });

        // Automatically make owner a member with owner role
        await tx.roomMember.create({
            data: {
                roomId: room.id,
                userId: ownerId,
                role: "owner",
            },
        });

        return room;
    });
};