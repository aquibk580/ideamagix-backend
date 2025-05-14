import { Router } from "express";
import { getProfile } from "../../controllers/docter/profile.js";
import { isDoctorLoggedIn } from "../../middlewares/auth.js";

const router: Router = Router();

router.get("/", isDoctorLoggedIn, getProfile);

export default router;
