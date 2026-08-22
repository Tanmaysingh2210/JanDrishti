import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import citizenAuthRoutes
  from "./routes/citizenAuthRoutes.js";
import departmentRoutes
  from "./routes/departmentRoutes.js";
import universityRoutes
  from "./routes/universityRoutes.js";
import universityUserRoutes
  from "./routes/universityUserRoutes.js";
import governmentRoutes
  from "./routes/governmentRoutes.js";
import governmentUserRoutes
  from "./routes/governmentUserRoutes.js";
import governmentAuthRoutes
  from "./routes/governmentAuthRoutes.js";
import industryAuthRoutes
  from "./routes/industryAuthRoutes.js";

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


// Citizen
app.use(
  "/api/citizen/auth",
  citizenAuthRoutes
);


// University
app.use(
  "/api/university",
  universityRoutes
);

app.use(
  "/api/university/users",
  universityUserRoutes
);

app.use(
  "/api/university/departments",
  departmentRoutes
);


// Government
app.use(
  "/api/government",
  governmentRoutes
);

app.use(
  "/api/government/users",
  governmentUserRoutes
);

app.use(
  "/api/government/auth",
  governmentAuthRoutes
);

app.use(
  "/api/industry/auth",
  industryAuthRoutes
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