import express from "express";
import { prisma } from "./utils/prisma.js";
import { authMiddleware, isAdminMiddleware } from "./utils/middleware.js";
import { generateToken, hashPassword } from "./utils/utils.js";
import { AdminRequest, AuthRequest } from "./utils/middleware.js";

const userRouter = express.Router();

userRouter.use(authMiddleware);

userRouter.get("/", async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
        }
    });

    res.json(users);
});

userRouter.get("/:id", async (req, res) => {
    const user = await prisma.user.findUnique({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
        },
        where: {
            id: req.params.id,
        }
    });

    res.json(user);
});

userRouter.post("/", isAdminMiddleware, async (req: AdminRequest, res) => {
    if (!req.isAdmin) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { username, email, password} = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = hashPassword(password);

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await prisma.user.create({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
        },
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });

    res.status(201).json({ token: generateToken(user.id, "7d") });
});

userRouter.patch("/:id", isAdminMiddleware, async (req: AdminRequest, res) => {
    const user = await prisma.user.findUnique({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
        },
        where: { id: req.params.id } });

    if (!user || (user.id !== req.userId && req.isAdmin)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: req.params.id,
        },
        data: req.body,
    });

    res.json(updatedUser);
});

userRouter.delete("/:id", isAdminMiddleware, async (req: AdminRequest, res) => {
    const user = await prisma.user.findUnique({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
        },
        where: { id: req.params.id } });

    if (!user || (user.id !== req.userId && req.isAdmin)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const deletedUser = await prisma.user.delete({
        where: {
            id: req.params.id,
        }
    });

    res.json(deletedUser);
});

export default userRouter;