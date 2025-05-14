import { db } from "../../lib/db.js";
import { ObjectId } from "mongodb";
import { prescriptionSchema } from "../../schema.js";
// Get all consultations of a particular doctor
export async function getDoctorConsultations(req, res) {
    try {
        const doctorId = req.user?.id;
        if (!doctorId || !ObjectId.isValid(doctorId)) {
            res.status(400).json({ error: "Invalid or missing doctor ID" });
            return;
        }
        const consultations = await db.consultation.findMany({
            where: { doctorId },
            include: {
                Patient: true,
                prescription: true,
            },
        });
        res.status(200).json({ consultations });
    }
    catch (error) {
        console.error("ERROR_FETCHING_DOCTOR_CONSULTATIONS:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
// Create a prescription for a patient
export async function createPrescription(req, res) {
    try {
        const doctorId = req.user?.id;
        const { consultationId } = req.params;
        if (!doctorId || !ObjectId.isValid(doctorId)) {
            res.status(400).json({ error: "Invalid doctor ID" });
            return;
        }
        if (!consultationId || !ObjectId.isValid(consultationId)) {
            res.status(400).json({ error: "Invalid consultation ID" });
            return;
        }
        const validatedData = prescriptionSchema.parse(req.body);
        const consultation = await db.consultation.findUnique({
            where: { id: consultationId },
            include: {
                Doctor: true,
                Patient: true,
            },
        });
        if (!consultation || consultation.doctorId !== doctorId) {
            res.status(403).json({ error: "Unauthorized access" });
            return;
        }
        const prescription = await db.prescription.create({
            data: {
                consultationId,
                care: validatedData.care,
                medicines: validatedData.medicines
            },
        });
        await db.consultation.update({
            where: { id: consultationId },
            data: {
                prescriptionId: prescription.id,
            },
        });
        res.status(201).json({
            message: "Prescription created successfully",
            prescription,
        });
    }
    catch (error) {
        console.error("CREATE_PRESCRIPTION_ERROR:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
