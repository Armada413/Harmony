import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

router.get("/", authController.getUsers);
router.post("/add_user", authController.addOneUser);

export default router;
