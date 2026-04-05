const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const { createRecordSchema, updateRecordSchema, validate } = require('../validators/recordValidator');

router.use(authenticate);

/**
 * @swagger
 * /records:
 *   get:
 *     summary: List financial records (filterable, searchable, paginated)
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by transaction type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records from this date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records until this date (YYYY-MM-DD)
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum amount
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in category and description (case-insensitive)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Paginated list of financial records
 *       403:
 *         description: Access denied (Analyst or Admin only)
 *   post:
 *     summary: Create a financial record
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000.00
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: income
 *               category:
 *                 type: string
 *                 example: salary
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-15"
 *               description:
 *                 type: string
 *                 example: Monthly salary
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Validation failed
 *       403:
 *         description: Access denied (Admin only)
 */
router.get('/', authorize('analyst', 'admin'), recordController.getAllRecords);
router.post('/', authorize('admin'), validate(createRecordSchema), recordController.createRecord);

/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Get a financial record by ID
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Record details
 *       404:
 *         description: Record not found
 *   patch:
 *     summary: Update a financial record
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Record not found
 *   delete:
 *     summary: Soft delete a financial record
 *     tags: [Financial Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Record deleted successfully (soft delete)
 *       404:
 *         description: Record not found
 */
router.get('/:id', authorize('analyst', 'admin'), recordController.getRecordById);
router.patch('/:id', authorize('admin'), validate(updateRecordSchema), recordController.updateRecord);
router.delete('/:id', authorize('admin'), recordController.deleteRecord);

module.exports = router;
