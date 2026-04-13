const express = require('express');
const { getDeadlines, createDeadline, updateDeadline, deleteDeadline } = require('../controllers/deadlineController');
const { auth } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();

router.use(auth, tenantContext);

router.get('/', getDeadlines);
router.post('/', createDeadline);
router.put('/:id', updateDeadline);
router.delete('/:id', deleteDeadline);

module.exports = router;
