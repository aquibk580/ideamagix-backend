import jwt from "jsonwebtoken";
export function checkAuth(req, res) {
    try {
        const doctorToken = req.cookies?.doctorToken || false;
        const patientToken = req.cookies?.patientToken || false;
        if (doctorToken && patientToken) {
            const decodedPatientToken = jwt.verify(patientToken, process.env.JWT_SECRET);
            const decodedDoctorToken = jwt.verify(doctorToken, process.env.JWT_SECRET);
            res.status(200).json({
                authenticated: true,
                role: "both",
                patientId: decodedPatientToken.id,
                doctorId: decodedDoctorToken.id,
            });
        }
        else if (doctorToken) {
            const decodedDoctorToken = jwt.verify(doctorToken, process.env.JWT_SECRET);
            res.status(200).json({
                authenticated: true,
                role: "doctor",
                doctorId: decodedDoctorToken.id,
            });
        }
        else if (patientToken) {
            const decodedPatientToken = jwt.verify(patientToken, process.env.JWT_SECRET);
            res.status(200).json({
                authenticated: true,
                role: "patient",
                patientId: decodedPatientToken.id,
            });
        }
        else {
            res.status(200).json({ authenticated: false });
        }
    }
    catch (error) {
        console.log("ERROR_WHILE_CHECKING_AUTH", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
