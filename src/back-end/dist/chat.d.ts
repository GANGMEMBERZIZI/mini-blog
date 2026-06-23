import express from "express";
import { Request, Response, NextFunction } from 'express';
declare const router: import("express-serve-static-core").Router;
import { JwtPayload } from 'jsonwebtoken';
import { Pool } from "pg";
export declare const pool: Pool;
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => express.Response<any, Record<string, any>> | undefined;
export default router;
//# sourceMappingURL=chat.d.ts.map