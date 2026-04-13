const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();

router.use(auth, tenantContext);

router.get('/stats', getDashboardStats);

module.exports = router;
