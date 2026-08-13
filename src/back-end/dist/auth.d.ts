import express from "express";
declare const router: import("express-serve-static-core").Router;
import { Request, Response, NextFunction } from 'express';
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => express.Response<any, Record<string, any>> | undefined;
export default router;
//# sourceMappingURL=auth.d.ts.map