import express from "express";
import { authMiddleware } from "./utils/middleware";

const authRouter = express.Router();

authRouter.post("/register", (req, res) => {
    res.send("Register");
});

authRouter.post("/forgot-password", (req, res) => {
    res.send("Forgot Password");
});

authRouter.post("/login", (req, res) => {
    res.send("Login");
});

authRouter.post("/verify-email", authMiddleware, (req, res) => {
    res.send("Verify Email");
});

export default authRouter;