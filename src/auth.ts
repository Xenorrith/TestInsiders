import express from "express";
import { prisma } from "./utils/prisma.js";
import { comparePassword, generateToken, hashPassword, sendEmail, verifyToken } from "./utils/utils.js";
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

authRouter.get("/verify-email/:token", async (req, res) => {
    const email = verifyToken(req.params.token).userId;

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        }
    });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    await prisma.user.update({
        where: {
            email: email,
        },
        data: {
            emailVerified: true,
        },
    });

    res.json({ message: "Email verified" });
});

authRouter.post("/verify-email", authMiddleware, async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.userId as string,
        }
    });

    if (user?.emailVerified) {
        return res.status(401).json({ error: "Email already verified" });
    }

    const token = generateToken(user?.email as string);
    sendEmail(user?.email as string, "Verify Email", `<a href="http://localhost:3030/verify-email/${token}">Verify Email</a>`);
    return res.status(200).json({ message: "Check your email" });
});

export default authRouter;