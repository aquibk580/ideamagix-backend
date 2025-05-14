import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types/Payload";

export function checkAuth(req: Request, res: Response) {
  try {
    const doctorToken = req.cookies?.doctorToken || false;
    const patientToken = req.cookies?.patientToken || false;

    if (doctorToken && patientToken) {
      const decodedPatientToken = jwt.verify(
        patientToken,
        process.env.JWT_SECRET!
      ) as UserPayload;
      const decodedDoctorToken = jwt.verify(
        doctorToken,
        process.env.JWT_SECRET!
      ) as UserPayload;
      res.status(200).json({
        authenticated: true,
        role: "both",
        patientId: decodedPatientToken.id,
        doctorId: decodedDoctorToken.id,
      });
    } else if (doctorToken) {
      const decodedDoctorToken = jwt.verify(
        doctorToken,
        process.env.JWT_SECRET!
      ) as UserPayload;
      res.status(200).json({
        authenticated: true,
        role: "doctor",
        doctorId: decodedDoctorToken.id,
      });
    } else if (patientToken) {
      const decodedPatientToken = jwt.verify(
        patientToken,
        process.env.JWT_SECRET!
      ) as UserPayload;
      res.status(200).json({
        authenticated: true,
        role: "patient",
        patientId: decodedPatientToken.id,
      });
    } else {
      res.status(200).json({ authenticated: false });
    }
  } catch (error: any) {
    console.log("ERROR_WHILE_CHECKING_AUTH", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
}
