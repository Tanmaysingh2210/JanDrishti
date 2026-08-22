import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import citizenAuthRoutes
  from "./routes/citizenAuthRoutes.js";


dotenv.config();
connectDB();
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());
app.use(
  "/api/citizen/auth",
  citizenAuthRoutes
);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JanDrishti API is running",
  });
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});