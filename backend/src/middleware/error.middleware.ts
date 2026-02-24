import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { errorResponse } from "../utils/response";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return errorResponse(res, err.message, err.statusCode);
    }

    // Handle Prisma errors
    if (err.code && err.code.startsWith("P")) {
        return errorResponse(res, "Database operation failed", 400, {
            code: err.code,
            meta: err.meta,
        });
    }

    // Handle Zod errors (validation)
    if (err.name === "ZodError" || err.issues) {
        return errorResponse(res, "Validation Error", 400, err.issues);
    }

    // Default error
    console.error("[ERROR]", err);
    return errorResponse(res, "Internal Server Error", 500);
};
