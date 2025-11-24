import express from "express";
import { prisma } from "./utils/prisma.js";
import { isAdminMiddleware, authMiddleware, AuthRequest } from "./utils/middleware.js";

const bookRouter = express.Router();

bookRouter.use(authMiddleware);

bookRouter.get("/", async (req: AuthRequest, res) => {
    const books = await prisma.book.findMany();

    res.json(books);
});

bookRouter.get("/:id", async (req: AuthRequest, res) => {
    const book = await prisma.book.findUnique({
        where: {
            id: req.params.id,
        }
    });

    res.json(book);
});

bookRouter.get("/me", async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.userId as string,
        }
    });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const books = await prisma.book.findMany({
        where: {
            authorId: user.id,
        }
    });

    res.json(books);
});

bookRouter.post("/", isAdminMiddleware, async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.userId as string,
        }
    });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const { name, photo } = req.body;
    const book = await prisma.book.create({
        data: {
            name,
            authorId: user.id,
            photo,
        }
    });

    res.json(book);
});

bookRouter.patch("/:id", isAdminMiddleware, async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.userId as string,
        }
    });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const getBook = await prisma.book.findUnique({ where: { id: req.params.id } });

    if (getBook?.authorId !== user.id) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const { name, photo } = req.body;
    const book = await prisma.book.update({
        where: {
            id: req.params.id,
        },
        data: {
            name,
            photo,
        }
    });

    res.json(book);
});

bookRouter.delete("/:id", isAdminMiddleware, async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.userId as string,
        }
    });

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const getBook = await prisma.book.findUnique({ where: { id: req.params.id } });

    if (getBook?.authorId !== user.id) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const book = await prisma.book.delete({
        where: {
            id: req.params.id,
        }
    });

    res.json(book);
});

export default bookRouter;