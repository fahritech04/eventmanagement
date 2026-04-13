const express = require('express');
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, assignVendorToEvent } = require('../controllers/eventController');
const { auth } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();

router.use(auth, tenantContext);

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/vendors', assignVendorToEvent);

module.exports = router;
