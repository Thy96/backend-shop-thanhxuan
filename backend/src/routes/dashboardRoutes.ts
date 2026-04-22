import { Router } from 'express';
import { getDashboardStats, getRevenueByMonth, getRevenueByYear, getVisitsByMonth, getTopProducts, getTopUsers } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, authorize('admin', 'editor'), getDashboardStats);
router.get('/stats/revenue', authenticate, authorize('admin', 'editor'), getRevenueByMonth);
router.get('/stats/revenue-by-year', authenticate, authorize('admin', 'editor'), getRevenueByYear);
router.get('/stats/visits', authenticate, authorize('admin', 'editor'), getVisitsByMonth);
router.get('/stats/top-products', authenticate, authorize('admin', 'editor'), getTopProducts);
router.get('/stats/top-users', authenticate, authorize('admin', 'editor'), getTopUsers);

export default router;