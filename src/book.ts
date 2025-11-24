import express from "express";
import { isAdminMiddleware, authMiddleware } from "./utils/middleware";

const bookRouter = express.Router();

bookRouter.use(authMiddleware);

bookRouter.get("/", (req, res) => {
    res.send("get all books");
});

bookRouter.get("/me", (req, res) => {
    res.send("get my books");
});

bookRouter.post("/", isAdminMiddleware, (req, res) => {
    res.send("create book");
});

bookRouter.put("/:id", isAdminMiddleware, (req, res) => {
    res.send("update book");
});

bookRouter.delete("/:id", isAdminMiddleware, (req, res) => {
    res.send("delete book");
});

export default bookRouter;