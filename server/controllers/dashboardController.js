const { queryWithTenant } = require('../config/db');

const getDashboardStats = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;

    // Run all queries in parallel
    const [
      eventsStats,
      deadlineStats,
      revenueStats,
      meetingsToday,
      upcomingDeadlines,
      upcomingMeetings,
      recentPayments,
      monthlyRevenue,
      eventsByStatus,
      vendorsByCategory,
    ] = await Promise.all([
      // Total events by status
      queryWithTenant(tenantId,
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
         FROM events`, []),

      // Deadline stats
      queryWithTenant(tenantId,
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue,
          COUNT(CASE WHEN due_date <= NOW() + INTERVAL '48 hours' AND status NOT IN ('completed') THEN 1 END) as urgent
         FROM deadlines`, []),

      // Revenue this month
      queryWithTenant(tenantId,
        `SELECT 
          COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_this_month,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount
         FROM payments
         WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
           AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())`, []),

      // Meetings today
      queryWithTenant(tenantId,
        `SELECT COUNT(*) as count FROM meetings 
         WHERE DATE(meeting_date) = CURRENT_DATE AND status = 'scheduled'`, []),

      // Upcoming deadlines (next 7 days)
      queryWithTenant(tenantId,
        `SELECT d.*, e.title as event_title, e.client_name,
                EXTRACT(EPOCH FROM (d.due_date - NOW())) / 3600 as hours_remaining
         FROM deadlines d JOIN events e ON d.event_id = e.id
         WHERE d.status NOT IN ('completed')
           AND d.due_date >= NOW()
           AND d.due_date <= NOW() + INTERVAL '7 days'
         ORDER BY d.due_date ASC LIMIT 10`, []),

      // Upcoming meetings (next 7 days)
      queryWithTenant(tenantId,
        `SELECT m.*, e.title as event_title
         FROM meetings m LEFT JOIN events e ON m.event_id = e.id
         WHERE m.meeting_date >= NOW() AND m.status = 'scheduled'
         ORDER BY m.meeting_date ASC LIMIT 5`, []),

      // Recent payments
      queryWithTenant(tenantId,
        `SELECT p.*, e.title as event_title, v.name as vendor_name
         FROM payments p 
         JOIN events e ON p.event_id = e.id 
         LEFT JOIN vendors v ON p.vendor_id = v.id
         ORDER BY p.created_at DESC LIMIT 5`, []),

      // Monthly revenue (last 6 months)
      queryWithTenant(tenantId,
        `SELECT 
          TO_CHAR(DATE_TRUNC('month', payment_date), 'YYYY-MM') as month,
          TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon') as month_label,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as revenue
         FROM payments
         WHERE payment_date >= NOW() - INTERVAL '6 months'
         GROUP BY DATE_TRUNC('month', payment_date)
         ORDER BY month ASC`, []),

      // Events by status (for donut chart)
      queryWithTenant(tenantId,
        `SELECT status, COUNT(*) as count FROM events GROUP BY status`, []),

      // Vendors by category
      queryWithTenant(tenantId,
        `SELECT category, COUNT(*) as count FROM vendors WHERE is_active = true GROUP BY category ORDER BY count DESC`, []),
    ]);

    res.json({
      stats: {
        events: eventsStats.rows[0],
        deadlines: deadlineStats.rows[0],
        revenue: revenueStats.rows[0],
        meetingsToday: parseInt(meetingsToday.rows[0].count),
      },
      upcomingDeadlines: upcomingDeadlines.rows,
      upcomingMeetings: upcomingMeetings.rows,
      recentPayments: recentPayments.rows,
      monthlyRevenue: monthlyRevenue.rows,
      eventsByStatus: eventsByStatus.rows,
      vendorsByCategory: vendorsByCategory.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
