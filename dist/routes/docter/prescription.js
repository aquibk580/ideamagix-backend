import { Router } from "express";
import { createPrescription, getDoctorConsultations, } from "../../controllers/docter/prescription.js";
const router = Router();
// Fetch all consultations for a doctor
router.get("/consultations", getDoctorConsultations);
// Create prescription for a consultation
router.post("/:consultationId", createPrescription);
export default router;
