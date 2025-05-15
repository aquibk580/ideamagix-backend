import { ZodSchema, z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { db } from "../../lib/db.js";
import { uploadToCloudinary } from "../../lib/cloudinary.js";
import { doctorSchema, doctorSignInSchema } from "../../schema.js";

interface Doctor {
  name: string;
  email: string;
  phone: string;
  password: string;
  specialty: string;
  experience: number;
}

// Doctor Signup
async function signup(req: Request, res: Response): Promise<void> {
  try {
    const doctotData: Doctor = doctorSchema.parse(req.body);

    const image = req.file;

    if (!image) {
      res
        .status(400)
        .json({ error: "Profile picture is required", flag: "PFPIsRequired" });
      return;
    }

    const existingDoctor = await db.doctor.findUnique({
      where: {
        email: doctotData.email,
      },
    });

    if (existingDoctor) {
      res
        .status(400)
        .json({ error: "Email already exists", flag: "DoctorExists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(doctotData.password, 10);

    const pfpUrl = await uploadToCloudinary(
      image.buffer,
      process.env.DOCTOR_PROFILE_PICTURE!
    );

    const doctor = await db.doctor.create({
      data: {
        ...doctotData,
        password: hashedPassword,
        profileImage: pfpUrl,
      },
    });

    const { password: _, ...safeDoctorData } = doctor;

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: "doctor" },
      jwtSecret,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    res.cookie("doctorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(201)
      .json({ message: "Doctor created successfully", doctor: safeDoctorData });
    return;
  } catch (err: any) {
    if (err.name === "ZodError") {
      res.status(400).json({ error: err.errors }); // Validation errors
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" }); // General server error
    return;
  }
}

interface DoctorSignIn {
  email: string;
  password: string;
}

// Doctor Signin
async function signin(req: Request, res: Response): Promise<void> {
  try {
    const doctorData: DoctorSignIn = await doctorSignInSchema.parse(req.body);

    const doctor = await db.doctor.findUnique({
      where: { email: doctorData.email },
    });

    if (!doctor || !doctor.password) {
      res
        .status(404)
        .json({ error: "doctor not found.", flag: "DoctorNotFound" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      doctorData.password,
      doctor.password
    );
    if (!isPasswordCorrect) {
      res.status(401).json({
        error: "Invalid email or password.",
        flag: "InvalidCredentials",
      });
      return;
    }

    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: "doctor" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("doctorToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Logged in successfully.", doctor });
  } catch (error: any) {
    console.error("Signin error:", error);

    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
}

// Doctor Logout
function logout(req: Request, res: Response) {
  res.clearCookie("doctorToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
}

export { signup, signin, logout };
