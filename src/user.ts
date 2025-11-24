import express from "express";
import { authMiddleware, isAdminMiddleware } from "./utils/middleware";

const userRouter = express.Router();

userRouter.use(authMiddleware);

userRouter.get("/", (req, res) => {
    res.send("Users");
});

userRouter.get("/:id", (req, res) => {
    res.send("Get User");
});

userRouter.post("/", isAdminMiddleware, (req, res) => {
    res.send("Create User");
});

userRouter.put("/:id", isAdminMiddleware, (req, res) => {
    res.send("Update User");
});

userRouter.delete("/:id", isAdminMiddleware, (req, res) => {
    res.send("Delete User");
});

export default userRouter;