import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRouter from "./auth.js";
import userRouter from "./user.js";
import bookRouter from "./book.js";
import tradeRouter from "./trade.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: true,
}));

app.use("/", authRouter);
app.use("/user", userRouter);
app.use("/book", bookRouter);
app.use("/trade", tradeRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});
