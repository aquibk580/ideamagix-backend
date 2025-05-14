import { Router } from "express";
import { signin, signup, logout } from "../../controllers/docter/auth.js";
import { upload } from "../../lib/multer.js";
const router = Router();
// Sign up Route
router.post("/signup", upload.single("pfp"), signup);
// Sign in Route
router.post("/signin", signin);
// Logout Route
router.post("/logout", logout);
export default router;
