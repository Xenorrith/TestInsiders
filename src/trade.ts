import express from "express";
import { prisma } from "./utils/prisma.js";
import { authMiddleware, AuthRequest } from "./utils/middleware.js";
import { TradeStatus } from "./generated/prisma/enums.js";

const tradeRouter = express.Router();

tradeRouter.post("/", authMiddleware, async (req: AuthRequest, res) => {
    const { receiverId, senderBookId, receiverBookId } = req.body;

    if (!receiverId || !senderBookId || !receiverBookId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const trade = await prisma.trade.create({
        data: {
            senderId: req.userId as string,
            receiverId,
            senderBookId,
            receiverBookId,
        },
    });

    res.json(trade);
});

tradeRouter.patch("/:id", authMiddleware, async (req: AuthRequest, res) => {
    const tradeId = req.params.id;
    const requesterId = req.userId;

    const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade) return res.status(404).json({ error: "Trade not found" });

    const rawStatus = req.body.status;
    if (!rawStatus) return res.status(400).json({ error: "Missing status" });

    if (!Object.values(TradeStatus).includes(rawStatus))
      return res.status(400).json({ error: "Invalid status" });

    if (rawStatus === TradeStatus.ACCEPTED && requesterId !== trade.receiverId)
      return res.status(403).json({ error: "Only receiver can accept" });

    if (rawStatus === TradeStatus.ACCEPTED) {
      const [senderBook, receiverBook] = await Promise.all([
        prisma.book.findUnique({ where: { id: trade.senderBookId } }),
        prisma.book.findUnique({ where: { id: trade.receiverBookId } }),
      ]);

      if (!senderBook || !receiverBook)
        return res.status(400).json({ error: "Books not found" });

      if (
        senderBook.authorId !== trade.receiverId ||
        receiverBook.authorId !== trade.senderId
      ) {
        return res.status(400).json({ error: "One of books already changed owner" });
      }

      const result = await prisma.$transaction([
        prisma.book.update({
          where: { id: receiverBook.id },
          data: { authorId: trade.receiverId },
        }),

        prisma.book.update({
          where: { id: senderBook.id },
          data: { authorId: trade.senderId },
        }),
      ]);

      return res.json({ success: true, result });
    }

    const updated = await prisma.trade.update({
      where: { id: tradeId },
      data: { status: rawStatus },
    });

    res.json(updated);
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