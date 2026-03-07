import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { resetPasswordLimiter } from '../middlewares/resetPasswordLimiter';

import { login, logout, me, register, resendVerify, updateMe, verifyEmail } from '../controllers/authController';
import { changePassword } from '../controllers/changePasswordController';
import { forgotPassword } from '../controllers/forgotPasswordController';
import { resetPassword } from '../controllers/resetPasswordController';

const router = Router();
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, authorize('admin', 'editor'), me);
router.get('/verify-email', verifyEmail);

// 🔐 change password
router.post('/change-password', authenticate, authorize('admin', 'editor'), changePassword);

router.post('/register', register);
router.post('/resend-verify', resendVerify);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

router.put('/me', authenticate, authorize('admin', 'editor'), updateMe)

export default router;
