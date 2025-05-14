import { Router } from "express";
import { checkAuth } from "../controllers/auth.js";
const router = Router();
router.post("/checkAuth", checkAuth);
export default router;
