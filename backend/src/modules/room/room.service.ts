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

export const deleteRoom = async ({ name, ownerId }: { name: string; ownerId: string }) => {
    const room = await prisma.room.findUnique({ where: { id: name } });
    if (!room) {
        throw new AppError("Room not found", 404);
    }
    if (room.ownerId !== ownerId) {
        throw new AppError("You are not the owner of this room", 403);
    }
    await prisma.room.delete({ where: { id: room.id } });
    return { message: "Room deleted successfully" };
};

