export interface UserPayload {
  id: string;
  email: string;
  role: "doctor" | "patient";
}
