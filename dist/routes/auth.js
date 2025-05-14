import { Router } from "express";
import { checkAuth } from "../controllers/auth.js";
const router = Router();
router.get("/checkAuth", checkAuth);
export default router;
