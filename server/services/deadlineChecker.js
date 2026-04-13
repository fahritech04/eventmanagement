const cron = require('node-cron');
const { pool } = require('../config/db');
const { sendWebhook } = require('./webhookService');

// Check approaching deadlines and send webhooks
const checkDeadlines = async () => {
  console.log(`[${new Date().toISOString()}] Checking approaching deadlines...`);

  const client = await pool.connect();
  try {
    // Get all active tenants with webhook configs
    const tenantsResult = await client.query(
      `SELECT DISTINCT t.id, t.name 
       FROM tenants t 
       JOIN webhook_configs wc ON wc.tenant_id = t.id 
       WHERE wc.is_active = true AND t.is_active = true`
    );

    for (const tenant of tenantsResult.rows) {
      try {
        // Set tenant context
        await client.query('BEGIN');
        await client.query(`SET LOCAL app.current_tenant_id = '${tenant.id}'`);

        // Find deadlines approaching in 24h, 48h, 7 days
        const deadlinesResult = await client.query(
          `SELECT d.*, e.title as event_title, e.client_name, e.client_phone,
                  EXTRACT(EPOCH FROM (d.due_date - NOW())) / 3600 as hours_remaining
           FROM deadlines d 
           JOIN events e ON d.event_id = e.id
           WHERE d.status NOT IN ('completed')
             AND d.due_date > NOW()
             AND d.due_date <= NOW() + INTERVAL '7 days'
             AND d.reminder_sent = false
           ORDER BY d.due_date ASC`
        );

        await client.query('COMMIT');

        if (deadlinesResult.rows.length === 0) continue;

        // Get webhook configs for this tenant
        await client.query('BEGIN');
        await client.query(`SET LOCAL app.current_tenant_id = '${tenant.id}'`);
        const webhookResult = await client.query(
          `SELECT * FROM webhook_configs WHERE is_active = true AND 'deadline.approaching' = ANY(events_subscribed)`
        );
        await client.query('COMMIT');

        // Send webhooks for each deadline
        for (const deadline of deadlinesResult.rows) {
          const hoursRemaining = Math.round(deadline.hours_remaining);
          
          // Only send for specific thresholds: 24h, 48h, 168h (7 days)
          let shouldSend = false;
          if (hoursRemaining <= 24) shouldSend = true;
          else if (hoursRemaining <= 48) shouldSend = true;
          else if (hoursRemaining <= 168) shouldSend = true;

          if (!shouldSend) continue;

          const payload = {
            event_type: hoursRemaining <= 0 ? 'deadline.overdue' : 'deadline.approaching',
            tenant: { id: tenant.id, name: tenant.name },
            data: {
              deadline_id: deadline.id,
              deadline_title: deadline.title,
              event_title: deadline.event_title,
              due_date: deadline.due_date,
              hours_remaining: hoursRemaining,
              priority: deadline.priority,
              assigned_to: deadline.assigned_to,
              client_name: deadline.client_name,
              client_phone: deadline.client_phone,
              description: deadline.description,
            },
            timestamp: new Date().toISOString(),
          };

          for (const webhook of webhookResult.rows) {
            await sendWebhook(webhook, payload, tenant.id);
          }

          // Mark reminder as sent (only for ≤24h)
          if (hoursRemaining <= 24) {
            await client.query('BEGIN');
            await client.query(`SET LOCAL app.current_tenant_id = '${tenant.id}'`);
            await client.query(
              'UPDATE deadlines SET reminder_sent = true WHERE id = $1',
              [deadline.id]
            );
            await client.query('COMMIT');
          }
        }

        // Check overdue deadlines
        await client.query('BEGIN');
        await client.query(`SET LOCAL app.current_tenant_id = '${tenant.id}'`);
        const overdueResult = await client.query(
          `UPDATE deadlines SET status = 'overdue' 
           WHERE status IN ('pending', 'in_progress') AND due_date < NOW()
           RETURNING *`
        );
        await client.query('COMMIT');

        if (overdueResult.rows.length > 0) {
          console.log(`[Tenant: ${tenant.name}] ${overdueResult.rows.length} deadline(s) marked as overdue.`);
        }

      } catch (tenantError) {
        await client.query('ROLLBACK');
        console.error(`Error processing tenant ${tenant.name}:`, tenantError.message);
      }
    }
  } catch (error) {
    console.error('Deadline checker error:', error.message);
  } finally {
    client.release();
  }
};

// Schedule: run every hour
const startDeadlineChecker = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', () => {
    checkDeadlines();
  });

  console.log('✅ Deadline checker cron job started (runs every hour)');

  // Also run once on startup (after 5 seconds)
  setTimeout(checkDeadlines, 5000);
};

module.exports = { startDeadlineChecker, checkDeadlines };
