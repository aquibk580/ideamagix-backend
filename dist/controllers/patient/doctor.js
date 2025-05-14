import { db } from "../../lib/db.js";
import { consultationSchema } from "../../schema.js";
import { ObjectId } from "mongodb";
// Get all doctors
export async function getAllDoctors(req, res) {
    try {
        const docters = await db.doctor.findMany({});
        if (docters.length === 0) {
            res.status(404).json({ error: "Docters not available" });
            return;
        }
        res.status(200).json(docters);
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_ALL_DOCTORS");
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
    }
}
// Consult a doctor
export async function consultDoctor(req, res) {
    try {
        const doctorId = req.params.doctorId;
        const patientId = req.user?.id;
        if (!doctorId || !ObjectId.isValid(doctorId)) {
            res.status(400).json({ error: "Invalid doctorId" });
            return;
        }
        if (!patientId || !ObjectId.isValid(patientId)) {
            res.status(400).json({ error: "Invalid patientId" });
            return;
        }
        const validatedData = consultationSchema.parse(req.body);
        const newConsultation = await db.consultation.create({
            data: {
                doctorId,
                patientId,
                step1Illness: validatedData.step1Illness,
                step1Surgery: validatedData.step1Surgery,
                diabetesStatus: validatedData.diabetesStatus,
                allergies: validatedData.allergies,
                others: validatedData.others,
                paymentTxnId: validatedData.paymentTxnId,
                prescriptionId: validatedData.prescriptionId ?? undefined,
            },
        });
        res.status(201).json({
            message: "Consultation created successfully",
            consultation: newConsultation,
        });
        return;
    }
    catch (error) {
        console.error("ERROR_CREATING_CONSULTATION:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
        });
        return;
    }
}
