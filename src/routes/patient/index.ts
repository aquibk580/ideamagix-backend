import { Router } from "express";
import authRoutes from "./auth.js";
import {
  consultDoctor,
  getAllDoctors,
} from "../../controllers/patient/doctor.js";
import { isPatientLoggedIn } from "../../middlewares/auth.js";

const router: Router = Router();

// Auth Routes
router.use("/auth", authRoutes);

// Doctor Routes
router.get("/doctors", getAllDoctors);

// Consult Routes
router.post("/consult/:doctorId", isPatientLoggedIn, consultDoctor);

export default router;
