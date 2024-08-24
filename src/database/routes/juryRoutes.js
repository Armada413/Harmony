import { Router } from "express";
import juryController from "../controllers/juryController.js";

const router = Router();

router.post("/report", juryController.createReport);
router.post("/request", juryController.createJuryRequest);
router.patch("/update_request", juryController.updateJuryAttendance);
router.patch("/test_update_request", juryController.testUpdateJuryAttendance);

export default router;
