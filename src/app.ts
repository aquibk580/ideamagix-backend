import express, { Express } from "express";
import docterRoutes from "./routes/docter/index.js";
import patientRoutes from "./routes/patient/index.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const PORT = 8000;
const app: Express = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: "http://localhost:5173",
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

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return;
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, (err) => {
  if (err) {
    console.log(`Error Occured while running the server`);
  } else {
    console.log(`Server is running on ${PORT}`);
  }
});
