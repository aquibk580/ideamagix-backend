import { z, ZodSchema } from "zod";
import { ObjectId } from "mongodb";

const objectIdSchema = z.string().refine((val) => ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

// Consultation Schema
export const consultationSchema = z.object({
  patientId: objectIdSchema,
  doctorId: objectIdSchema,
  step1Illness: z.string(),
  step1Surgery: z.string(),
  diabetesStatus: z.enum(["Diabetics", "Diabetics"]),
  allergies: z.string(),
  others: z.string(),
  paymentTxnId: z.string(),
  prescriptionId: objectIdSchema.optional().nullable(),
});

// Patient Schema
export const patientSchema: ZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  surgeryHistory: z.string().optional().nullable(),
  illnessHistory: z.string().optional().nullable(),
  age: z.coerce
    .number()
    .min(0, "Age must be a non-negative number")
    .max(120, "Age must be less than or equal to 120"),
});

// Doctor Schema
export const doctorSchema: ZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialty: z.string().min(1, "Specialty is required"),
  experience: z.coerce
    .number()
    .min(0, "Experience must be a non-negative number"),
});

// Doctor Signin Schema
export const doctorSignInSchema: ZodSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Patient Signin Schema
export const patientSignInSchema: ZodSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Prescription Schema
export const prescriptionSchema = z.object({
  care: z.string().min(1, "Care instructions are required"),
  medicines: z.string().optional(),
});
