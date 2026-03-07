import { Router } from 'express';
import { getDashboardStats, getRevenueByMonth, getVisitsByMonth } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize('admin', 'editor'), getDashboardStats);
router.get('/stats/revenue', authenticate, authorize('admin', 'editor'), getRevenueByMonth);
router.get('/stats/visits', authenticate, authorize('admin', 'editor'), getVisitsByMonth);

export default router;