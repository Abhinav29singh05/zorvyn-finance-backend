const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(authenticate);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get total income, expenses, and net balance
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_income:
 *                       type: number
 *                       example: 15500.00
 *                     total_expenses:
 *                       type: number
 *                       example: 4100.00
 *                     net_balance:
 *                       type: number
 *                       example: 11400.00
 */
router.get('/summary', authorize('viewer', 'analyst', 'admin'), dashboardController.getSummary);

/**
 * @swagger
 * /dashboard/category-totals:
 *   get:
 *     summary: Get totals grouped by category and type
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category-wise totals
 */
router.get('/category-totals', authorize('viewer', 'analyst', 'admin'), dashboardController.getCategoryTotals);

/**
 * @swagger
 * /dashboard/recent-activity:
 *   get:
 *     summary: Get the most recent transactions
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of recent records to return
 *     responses:
 *       200:
 *         description: List of recent transactions
 */
router.get('/recent-activity', authorize('viewer', 'analyst', 'admin'), dashboardController.getRecentActivity);

/**
 * @swagger
 * /dashboard/trends:
 *   get:
 *     summary: Get monthly income vs expense trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trends data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-01"
 *                       income:
 *                         type: number
 *                       expenses:
 *                         type: number
 *                       net:
 *                         type: number
 */
router.get('/trends', authorize('viewer', 'analyst', 'admin'), dashboardController.getTrends);

module.exports = router;
