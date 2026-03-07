import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { editUser, getUserById, getUsers, blockUser } from '../controllers/userController';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  getUsers
);
router.get("/:id", authenticate,
  authorize('admin'), getUserById);

router.put("/:id", authenticate,
  authorize('admin'), editUser);
router.patch("/:id/block", authenticate,
  authorize('admin'), blockUser);

export default router;