const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

// Send webhook to configured URL
const sendWebhook = async (config, payload, tenantId) => {
  const logId = uuidv4();

  try {
    // Add signature to payload
    const signature = crypto
      .createHmac('sha256', config.secret || process.env.WEBHOOK_SIGNING_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    const response = await axios.post(config.url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': payload.event_type,
        'X-Webhook-Delivery': logId,
      },
      timeout: 10000, // 10 second timeout
    });

    // Log success
    await logWebhookDelivery(logId, tenantId, config.id, payload.event_type, payload, response.status, 'OK', null);

    return { success: true, statusCode: response.status };
  } catch (error) {
    const statusCode = error.response?.status || 0;
    const errorMessage = error.message;

    // Log failure
    await logWebhookDelivery(logId, tenantId, config.id, payload.event_type, payload, statusCode, null, errorMessage);

    return { success: false, statusCode, error: errorMessage };
  }
};

// Log webhook delivery to database
const logWebhookDelivery = async (id, tenantId, configId, eventType, payload, statusCode, response, error) => {
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
      await client.query(
        `INSERT INTO webhook_logs (id, tenant_id, webhook_config_id, event_type, payload, status_code, response, error)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, tenantId, configId, eventType, JSON.stringify(payload), statusCode, response, error]
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Failed to log webhook:', e.message);
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('Failed to get DB connection for webhook log:', e.message);
  }
};

module.exports = { sendWebhook };
