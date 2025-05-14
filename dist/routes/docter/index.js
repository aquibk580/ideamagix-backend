import { Router } from "express";
import authRoutes from "./auth.js";
import profileRoutes from "./profile.js";
import prescriptionRoutes from "./prescription.js";
import { sendPdf } from "../../controllers/docter/index.js";
import { isDoctorLoggedIn } from "../../middlewares/auth.js";
import { getDoctorConsultations } from "../../controllers/docter/prescription.js";
const router = Router();
// Auth Routes
router.use("/auth", authRoutes);
// Profile Routes
router.use("/profile", isDoctorLoggedIn, profileRoutes);
// Presecriptions Routes
router.use("/prescriptions", isDoctorLoggedIn, prescriptionRoutes);
// Get Doctor Consultations
router.use("/consultations", isDoctorLoggedIn, getDoctorConsultations);
// Send pdf
router.post("/send-pdf/:consultationId", isDoctorLoggedIn, sendPdf);
export default router;
