import { Router } from "express";
import { forgotPassword } from "../controllers/forgotPasswordController";

const router = Router();

router.post("/api/auth/forgot-password", forgotPassword);