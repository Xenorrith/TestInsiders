import express from "express";
import { authMiddleware, AuthRequest } from "./utils/middleware.js";

const tradeRouter = express.Router();

tradeRouter.post("/", authMiddleware, async (req: AuthRequest, res) => {
    res.json({ message: "Send trade" });
});

tradeRouter.get("/me/", authMiddleware, async (req: AuthRequest, res) => {
    res.json({ message: "My trades" });
});

export default tradeRouter;