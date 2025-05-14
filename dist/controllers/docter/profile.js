import { db } from "../../lib/db.js";
import { ObjectId } from "mongodb";
async function getProfile(req, res) {
    try {
        const doctorId = req.user?.id;
        if (!doctorId || !ObjectId.isValid(doctorId)) {
            res.status(400).json({ error: "Invalid or missing doctor ID" });
            return;
        }
        const doctor = await db.doctor.findUnique({
            where: { id: doctorId },
            include: {
                consultations: true,
            },
        });
        if (!doctor) {
            res.status(404).json({ error: "Doctor not found" });
            return;
        }
        res.status(200).json(doctor);
        return;
    }
    catch (error) {
        console.error("ERROR_FETCHING_DOCTOR_PROFILE:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
        });
        return;
    }
}
export { getProfile };
