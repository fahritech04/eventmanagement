const express = require('express');
const { getWebhookConfigs, createWebhookConfig, updateWebhookConfig, deleteWebhookConfig, testWebhook, getWebhookLogs } = require('../controllers/webhookController');
const { auth } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();

router.use(auth, tenantContext);

router.get('/configs', getWebhookConfigs);
router.post('/configs', createWebhookConfig);
router.put('/configs/:id', updateWebhookConfig);
router.delete('/configs/:id', deleteWebhookConfig);
router.post('/configs/:id/test', testWebhook);
router.get('/logs', getWebhookLogs);

module.exports = router;
