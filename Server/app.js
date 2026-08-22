import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import citizenRoutes from "./routes/citizenRoutes.js";
import connectDB from "./config/db.js";

// Auth & Admin Routes
import citizenAuthRoutes from "./routes/citizenAuthRoutes.js";
import universityRoutes from "./routes/universityRoutes.js";
import universityUserRoutes from "./routes/universityUserRoutes.js";
import universityAuthRoutes from "./routes/universityAuthRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import governmentRoutes from "./routes/governmentRoutes.js";
import governmentUserRoutes from "./routes/governmentUserRoutes.js";
import governmentAuthRoutes from "./routes/governmentAuthRoutes.js";
import industryAuthRoutes from "./routes/industryAuthRoutes.js";

// Core Workflow Routes
import citizenIssueRoutes from "./routes/citizenIssueRoutes.js";
import governmentIssueRoutes from "./routes/governmentIssueRoutes.js";
import universityProposalRoutes from "./routes/universityProposalRoutes.js";
import governmentProposalRoutes from "./routes/governmentProposalRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import industryProposalRoutes from "./routes/industryProposalRoutes.js";



connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
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
  "/api/citizen",
  citizenRoutes
);

// Citizen APIs
app.use("/api/citizen/auth", citizenAuthRoutes);
app.use("/api/citizen/issues", citizenIssueRoutes);

// University APIs
app.use("/api/university", universityRoutes);
app.use("/api/university/auth", universityAuthRoutes);
app.use("/api/university/users", universityUserRoutes);
app.use("/api/university/departments", departmentRoutes);
app.use("/api/university/proposals", universityProposalRoutes);

// Government APIs
app.use("/api/government", governmentRoutes);
app.use("/api/government/users", governmentUserRoutes);
app.use("/api/government/auth", governmentAuthRoutes);
app.use("/api/government/issues", governmentIssueRoutes);
app.use("/api/government/proposals", governmentProposalRoutes);

// Shared Projects & Industry Support APIs
app.use("/api/projects", projectRoutes);
app.use("/api/industry/auth", industryAuthRoutes);
app.use("/api/industry/proposals", industryProposalRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JanDrishti API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});