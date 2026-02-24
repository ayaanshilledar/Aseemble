import { Request, Response } from "express";
import * as authService from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { successResponse } from "../../utils/response";

export const register = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  return successResponse(res, user, "User registered successfully", 201);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const data = await authService.login(req.body);
  return successResponse(res, data, "Login successful");
});