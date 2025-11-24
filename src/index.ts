import express from "express";
import dotenv from "dotenv";

import authRouter from "./auth.js";
import userRouter from "./user.js";
import bookRouter from "./book.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/", authRouter);
app.use("/user", userRouter);
app.use("/book", bookRouter);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server started on port ${process.env.PORT || 3000}`);
});
