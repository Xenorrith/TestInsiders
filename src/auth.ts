import express from "express";
import { prisma } from "./utils/prisma.js";
import { comparePassword, generateToken, hashPassword } from "./utils/utils.js";
import { authMiddleware, AuthRequest } from "./utils/middleware.js";

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
    const { username, email, password } = req.body || {};

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

authRouter.post("/forgot-password", (req, res) => {
    res.send("Forgot Password");
});

authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = comparePassword(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ token: generateToken(user.id) });
});

authRouter.post("/verify-email", authMiddleware, (req: AuthRequest, res) => {
    const user = prisma.user.findUnique({
        where: {
            id: req.userId as string,
        }
    });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Email verified" });
});

export default authRouter;