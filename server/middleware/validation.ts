/**
 * Validation Middleware
 * Validates request body using Zod schemas
 */

import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

/**
 * Validation middleware factory
 * @param schema - Zod schema to validate against
 */
export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}

