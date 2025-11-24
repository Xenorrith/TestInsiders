import express from "express";
import { prisma } from "./utils/prisma.js";
import { authMiddleware, isAdminMiddleware } from "./utils/middleware.js";
import { generateToken, hashPassword } from "./utils/utils.js";
import { AdminRequest, AuthRequest } from "./utils/middleware.js";

const userRouter = express.Router();

userRouter.use(authMiddleware);

userRouter.get("/", async (req, res) => {
    const users = await prisma.user.findMany();

    res.json(users);
});

userRouter.get("/:id", async (req, res) => {
    const user = await prisma.user.findUnique({
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
    const { username, email, password} = req.body || {};

    const hashedPassword = hashPassword(password);

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password: hashedPassword,
        },
    });

    res.status(201).json({ token: generateToken(user.id) });
});

userRouter.put("/:id", isAdminMiddleware, async (req: AuthRequest, res) => {
    const { username, email, password, role } = req.body || {};

    const hashedPassword = hashPassword(password);

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await prisma.user.update({
        where: {
            id: req.params.id,
        },
        data: {
            username,
            email,
            password: hashedPassword,
            role,
        },
    });

    res.json(user);
});

userRouter.delete("/:id", isAdminMiddleware, async (req: AuthRequest, res) => {
    const user = await prisma.user.delete({
        where: {
            id: req.params.id,
        }
    });

    res.json(user);
});

export default userRouter;