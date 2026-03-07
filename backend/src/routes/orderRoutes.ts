import { Router } from "express";

import { createOrder, getAllOrders, getMyOrders, getOrdersById, updateOrder } from "../controllers/orderController";

import { authenticate, authorize } from "../middlewares/auth";
import { optionalAuthenticate } from "../middlewares/optionalAuth";

const router = Router();

// USER
router.post("/", optionalAuthenticate, createOrder);
router.get("/my", authenticate, getMyOrders);

// ADMIN
router.get('/', authenticate, authorize('admin'), getAllOrders);
router.get('/:id', authenticate, authorize('admin'), getOrdersById);
router.put('/:id', authenticate, authorize('admin'), updateOrder);

export default router;
