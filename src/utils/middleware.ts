import { prisma } from "./prisma.js";
import { verifyToken } from "./utils.js";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  userId?: String;
}

interface AdminRequest extends AuthRequest {
  isAdmin?: boolean;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  req.userId = decoded.userId;

  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

const isAdminMiddleware = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.userId as string,
    }
  });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  req.isAdmin = user.role === "ADMIN";

  next();
}

export { authMiddleware, isAdminMiddleware, AuthRequest, AdminRequest };