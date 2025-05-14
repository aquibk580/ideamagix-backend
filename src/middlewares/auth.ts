import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types/Payload";

function createAuthMiddleware(cookieName: string, expectedRole: string) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.cookies[cookieName];

      if (!token) {
        res.status(401).json({
          error: "Unauthorized. No token provided.",
          flag: "NoTokenProvided",
        });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      if (
        typeof decoded === "object" &&
        decoded !== null &&
        "id" in decoded &&
        "email" in decoded &&
        "role" in decoded
      ) {
        req.user = decoded as UserPayload;

        if (req.user.role !== expectedRole) {
          res.status(403).json({
            error: `Access denied. Only ${expectedRole}s can access this route.`,
          });
          return;
        }

        next();
      } else {
        res.status(401).json({ error: "Invalid token payload" });
      }
    } catch (error: any) {
      if (error.name === "JsonWebTokenError") {
        res.status(401).json({ error: "Invalid token." });
      } else if (error.name === "TokenExpiredError") {
        res.status(401).json({ error: "Token has expired." });
      } else {
        console.error("Authentication Error:", error);
        res
          .status(500)
          .json({ error: "Internal Server Error", details: error.message });
      }
    }
  };
}

export const isDoctorLoggedIn = createAuthMiddleware("doctorToken", "doctor");
export const isPatientLoggedIn = createAuthMiddleware(
  "patientToken",
  "patient"
);
