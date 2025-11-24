import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./utils";

interface AuthRequest extends Request {
  userId?: number;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  
}

const isAdminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  
}

export { authMiddleware, isAdminMiddleware };