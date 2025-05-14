import express, { Express, NextFunction, Request, Response } from "express";
import docterRoutes from "./routes/docter/index.js";
import patientRoutes from "./routes/patient/index.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

const PORT = 8000;
const app: Express = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctor", docterRoutes);
app.use("/api/patient", patientRoutes);

app.listen(PORT, (err) => {
  if (err) {
    console.log(`Error Occured while running the server`);
  } else {
    console.log(`Server is running on ${PORT}`);
  }
});
