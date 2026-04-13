const { queryWithTenant } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { sendWebhook } = require('../services/webhookService');

// Get webhook configs
const getWebhookConfigs = async (req, res, next) => {
  try {
    const result = await queryWithTenant(req.user.tenantId,
      'SELECT * FROM webhook_configs ORDER BY created_at DESC', []);
    res.json({ webhooks: result.rows });
  } catch (error) {
    next(error);
  }
};

// Create webhook config
const createWebhookConfig = async (req, res, next) => {
  try {
    const { url, secret, events_subscribed } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL webhook wajib diisi.' });
    }

    const id = uuidv4();
    const result = await queryWithTenant(req.user.tenantId,
      `INSERT INTO webhook_configs (id, tenant_id, url, secret, events_subscribed)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, req.user.tenantId, url, secret, events_subscribed || ['deadline.approaching', 'deadline.overdue', 'payment.due', 'event.reminder']]
    );

    res.status(201).json({ message: 'Webhook berhasil dikonfigurasi!', webhook: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update webhook config
const updateWebhookConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { url, secret, events_subscribed, is_active } = req.body;

    const updates = [];
    const values = [];
    let idx = 1;

    if (url !== undefined) { updates.push(`url = $${idx++}`); values.push(url); }
    if (secret !== undefined) { updates.push(`secret = $${idx++}`); values.push(secret); }
    if (events_subscribed !== undefined) { updates.push(`events_subscribed = $${idx++}`); values.push(events_subscribed); }
    if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); values.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diupdate.' });
    }

    values.push(id);
    const result = await queryWithTenant(req.user.tenantId,
      `UPDATE webhook_configs SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook config tidak ditemukan.' });
    }

    res.json({ message: 'Webhook berhasil diupdate!', webhook: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Delete webhook config
const deleteWebhookConfig = async (req, res, next) => {
  try {
    const result = await queryWithTenant(req.user.tenantId,
      'DELETE FROM webhook_configs WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook config tidak ditemukan.' });
    }

    res.json({ message: 'Webhook berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

// Test webhook
const testWebhook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const configResult = await queryWithTenant(req.user.tenantId,
      'SELECT * FROM webhook_configs WHERE id = $1', [id]);

    if (configResult.rows.length === 0) {
      return res.status(404).json({ error: 'Webhook config tidak ditemukan.' });
    }

    const config = configResult.rows[0];
    const testPayload = {
      event_type: 'test',
      tenant: { id: req.user.tenantId, name: 'Test' },
      data: {
        message: 'Ini adalah test webhook dari EventPro.',
        timestamp: new Date().toISOString(),
      },
    };

    const result = await sendWebhook(config, testPayload, req.user.tenantId);

    res.json({
      message: result.success ? 'Test webhook berhasil dikirim!' : 'Test webhook gagal.',
      result,
    });
  } catch (error) {
    next(error);
  }
};

// Get webhook logs
const getWebhookLogs = async (req, res, next) => {
  try {
    const result = await queryWithTenant(req.user.tenantId,
      `SELECT wl.*, wc.url as webhook_url 
       FROM webhook_logs wl 
       LEFT JOIN webhook_configs wc ON wl.webhook_config_id = wc.id 
       ORDER BY wl.sent_at DESC LIMIT 50`, []);
    res.json({ logs: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWebhookConfigs, createWebhookConfig, updateWebhookConfig, deleteWebhookConfig, testWebhook, getWebhookLogs };
