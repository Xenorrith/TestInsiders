import express from "express";
import { prisma } from "./utils/prisma.js";
import { paginate } from "./utils/pagination.js";
import { Prisma } from "./generated/prisma/client.js";
import { isAdminMiddleware, authMiddleware, AuthRequest } from "./utils/middleware.js";

const bookRouter = express.Router();

bookRouter.use(authMiddleware);


// GET all books
bookRouter.get("/", async (req: AuthRequest, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await paginate<Prisma.BookWhereInput, any>(prisma.book, {
    page, limit, orderBy: { name: "asc" },
    where: {
      authorId: {
        not: req.userId as string,
      },
      name: {
        contains: (req.query.search as string) || "",
        mode: "insensitive"
      }
    },
  });
  res.json(result);
});

// GET books of current user
bookRouter.get("/me", async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId as string } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await paginate<Prisma.BookWhereInput, any>(prisma.book, {
    page,
    limit,
    where: { 
      authorId: user.id,
      name: {
        contains: (req.query.search as string) || "",
        mode: "insensitive"
      }
    },
    orderBy: { name: "asc" },
  });

  res.json(result);
});


bookRouter.get("/:id", async (req: AuthRequest, res) => {
    const book = await prisma.book.findUnique({
        where: {
            id: req.params.id,
        }
    });

    res.json(book);
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