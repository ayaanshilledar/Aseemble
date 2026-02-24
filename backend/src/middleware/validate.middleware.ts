import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validate = (schema: ZodObject<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            // Update req values with parsed values (e.g., coerced numbers)
            req.body = parsed.body;
            req.query = parsed.query as any;
            req.params = parsed.params as any;
 // latrer provide better type not any 
            return next();
        } catch (error) {
            return next(error);
        }
    };
};
