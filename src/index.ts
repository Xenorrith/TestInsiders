import express from "express";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import authRouter from "./auth";
import userRouter from "./user";
import bookRouter from "./book";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/", authRouter);
app.use("/user", userRouter);
app.use("/book", bookRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});
