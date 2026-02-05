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