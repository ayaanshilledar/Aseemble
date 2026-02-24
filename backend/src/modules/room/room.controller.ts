import { Request, Response } from "express";
import { createRoom, deleteRoom, getRoom } from "./room.service";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse } from "../../utils/response";

export const createRoomController = catchAsync(async (req: Request, res: Response) => {
    const room = await createRoom(req.body);
    return successResponse(res, room, "Room created successfully", 201);
});

export const deleteRoomController = catchAsync(async (req: Request, res: Response) => {
    const room = await deleteRoom(req.body);
    return successResponse(res, room, "Room deleted successfully", 200);
});

export const getRoomController = catchAsync(async (req: Request, res: Response) => {
    const room = await getRoom({ id: req.params.id as string });
    return successResponse(res, room, "Room fetched successfully", 200);
});
