import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validate = (schema: ZodObject<any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body ?? {},
                query: req.query ?? ({} as any),
                params: req.params ?? ({} as any),
            });


            if (parsed.body) req.body = parsed.body;
            if (parsed.query) req.query = parsed.query as any;
            if (parsed.params) req.params = parsed.params as any;

            return next();
        } catch (error) {
            return next(error);
        }
    };
};
