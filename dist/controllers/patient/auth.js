import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../lib/db.js";
import { uploadToCloudinary } from "../../lib/cloudinary.js";
import { patientSchema, patientSignInSchema } from "../../schema.js";
// Signup Controller
async function signup(req, res) {
    try {
        const doctotData = patientSchema.parse(req.body);
        const image = req.file;
        if (!image) {
            res
                .status(400)
                .json({ error: "Profile picture is required", flag: "PFPIsRequired" });
            return;
        }
        const existingPatient = await db.patient.findUnique({
            where: {
                email: doctotData.email,
            },
        });
        if (existingPatient) {
            res
                .status(400)
                .json({ error: "Email already exists", flag: "PatientExists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(doctotData.password, 10);
        const pfpUrl = await uploadToCloudinary(image.buffer, process.env.DOCTOR_PROFILE_PICTURE);
        const patient = await db.patient.create({
            data: {
                ...doctotData,
                password: hashedPassword,
                profileImage: pfpUrl,
            },
        });
        const { password: _, ...safePatientData } = patient;
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in the environment variables");
        }
        const token = jwt.sign({ id: patient.id, email: patient.email, role: "patient" }, jwtSecret, { expiresIn: "7d" } // Token expires in 7 days
        );
        res.cookie("patientToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            message: "Patient created successfully",
            patient: safePatientData,
        });
        return;
    }
    catch (err) {
        if (err.name === "ZodError") {
            res.status(400).json({ error: err.errors }); // Validation errors
            return;
        }
        console.error(err);
        res.status(500).json({ error: "Internal server error" }); // General server error
        return;
    }
}
// patient signin
async function signin(req, res) {
    try {
        const patientData = await patientSignInSchema.parse(req.body);
        const patient = await db.patient.findUnique({
            where: { email: patientData.email },
        });
        if (!patient || !patient.password) {
            res
                .status(404)
                .json({ error: "Patient not found.", flag: "PatientNotFound" });
            return;
        }
        const isPasswordCorrect = await bcrypt.compare(patientData.password, patient.password);
        if (!isPasswordCorrect) {
            res.status(401).json({
                error: "Invalid email or password.",
                flag: "InvalidCredentials",
            });
            return;
        }
        const token = jwt.sign({ id: patient.id, email: patient.email, role: "patient" }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("patientToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ message: "Logged in successfully.", patient });
    }
    catch (error) {
        console.error("Signin error:", error);
        if (error.name === "ZodError") {
            res.status(400).json({ error: error.errors });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    }
}
// Patient Logout
function logout(req, res) {
    res.clearCookie("patientToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
}
export { signup, signin, logout };
