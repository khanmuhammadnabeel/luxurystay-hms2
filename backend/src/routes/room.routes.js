/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Get room by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Room details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *   put:
 *     tags:
 *       - Rooms
 *     summary: Update room (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: Room updated
 *   delete:
 *     tags:
 *       - Rooms
 *     summary: Delete room (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Room deleted
 */
/**
 * @swagger
 * /api/rooms:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Get all rooms
 *     description: Retrieve list of rooms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [available, booked, maintenance, cleaning]
 *     responses:
 *       200:
 *         description: Rooms retrieved successfully
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
 *                     $ref: '#/components/schemas/Room'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */

// Your existing room routes code below...

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// GET all rooms
router.get('/', roomController.getAllRooms);

// GET check room availability for dates
router.get('/:id/availability', roomController.checkRoomAvailability);

// GET single room
router.get('/:id', roomController.getRoomById);

// POST create room
router.post('/', roomController.createRoom);

// PUT update room
router.put('/:id', roomController.updateRoom);

// PUT update room status (separate endpoint for status changes)
router.put('/:id/status', roomController.updateRoomStatus);

// DELETE room
router.delete('/:id', roomController.deleteRoom);

module.exports = router;