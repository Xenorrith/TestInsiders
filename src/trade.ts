import express from "express";
import { prisma } from "./utils/prisma.js";
import { authMiddleware, AuthRequest } from "./utils/middleware.js";

const tradeRouter = express.Router();

tradeRouter.post("/", authMiddleware, async (req: AuthRequest, res) => {
    res.json({ message: "Send trade" });
});

tradeRouter.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
    res.json({ message: "Accept trade or Reject trade" });
});

tradeRouter.get("/me/", authMiddleware, async (req: AuthRequest, res) => {
    const trades = await prisma.trade.findMany({
        where: {
            OR: [
                {
                    receiverId: req.userId as string,
                },
                {
                    senderId: req.userId as string,
                },
            ]
        },
    });
    
    res.json(trades);
});

export default tradeRouter;