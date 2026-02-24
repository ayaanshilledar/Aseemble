import { Response } from "express";

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: any;
}

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    success: boolean,
    message?: string,
    data?: T,
    errors?: any
) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
        errors,
    });
};

export const successResponse = <T>(res: Response, data: T, message: string = "Success", statusCode: number = 200) => {
    return sendResponse(res, statusCode, true, message, data);
};

export const errorResponse = (res: Response, message: string = "Error", statusCode: number = 500, errors?: any) => {
    return sendResponse(res, statusCode, false, message, undefined, errors);
};
