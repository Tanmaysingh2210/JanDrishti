import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import citizenAuthRoutes from "./routes/citizenAuthRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import universityRoutes from "./routes/universityRoutes.js";
import universityUserRoutes from "./routes/universityUserRoutes.js";
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


// =====================================================
// CITIZEN ROUTES
// =====================================================

app.use(
  "/api/citizen/auth",
  citizenAuthRoutes
);


// =====================================================
// UNIVERSITY ROUTES
// =====================================================

// University registration
app.use(
  "/api/university",
  universityRoutes
);


// University users
app.use(
  "/api/university/users",
  universityUserRoutes
);


// University departments
app.use(
  "/api/university/departments",
  departmentRoutes
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JanDrishti API is running",
  });
});


// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});