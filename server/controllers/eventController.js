const { queryWithTenant } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Assign vendor to event
const assignVendorToEvent = async (req, res, next) => {
  try {
    const { id: event_id } = req.params;
    const { vendor_id, agreed_price, notes } = req.body;

    if (!vendor_id) {
      return res.status(400).json({ error: 'Vendor ID wajib diisi.' });
    }

    const id = uuidv4();
    const result = await queryWithTenant(req.user.tenantId,
      `INSERT INTO event_vendors (id, tenant_id, event_id, vendor_id, agreed_price, payment_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, req.user.tenantId, event_id, vendor_id, agreed_price || 0, 'pending', notes]
    );

    res.status(201).json({ message: 'Vendor berhasil ditambahkan ke event!', assignment: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Vendor ini sudah ditambahkan ke event.' });
    }
    next(error);
  }
};

// Get all events
const getEvents = async (req, res, next) => {
  try {
    const { status, event_type, search } = req.query;
    let sql = `SELECT e.*, 
                (SELECT COUNT(*) FROM deadlines d WHERE d.event_id = e.id AND d.status != 'completed') as pending_deadlines,
                (SELECT COUNT(*) FROM event_vendors ev WHERE ev.event_id = e.id) as vendor_count
               FROM events e WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) {
      sql += ` AND e.status = $${idx++}`;
      params.push(status);
    }
    if (event_type) {
      sql += ` AND e.event_type = $${idx++}`;
      params.push(event_type);
    }
    if (search) {
      sql += ` AND (e.title ILIKE $${idx} OR e.client_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ' ORDER BY e.event_date ASC';

    const result = await queryWithTenant(req.user.tenantId, sql, params);
    res.json({ events: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get single event with details
const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventResult = await queryWithTenant(req.user.tenantId,
      'SELECT * FROM events WHERE id = $1', [id]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event tidak ditemukan.' });
    }

    // Get related data
    const [vendors, deadlines, payments, meetings] = await Promise.all([
      queryWithTenant(req.user.tenantId,
        `SELECT ev.*, v.name as vendor_name, v.category, v.phone as vendor_phone, v.email as vendor_email
         FROM event_vendors ev JOIN vendors v ON ev.vendor_id = v.id WHERE ev.event_id = $1`, [id]),
      queryWithTenant(req.user.tenantId,
        'SELECT * FROM deadlines WHERE event_id = $1 ORDER BY due_date ASC', [id]),
      queryWithTenant(req.user.tenantId,
        `SELECT p.*, v.name as vendor_name FROM payments p LEFT JOIN vendors v ON p.vendor_id = v.id WHERE p.event_id = $1 ORDER BY p.payment_date DESC NULLS LAST`, [id]),
      queryWithTenant(req.user.tenantId,
        'SELECT * FROM meetings WHERE event_id = $1 ORDER BY meeting_date ASC', [id]),
    ]);

    res.json({
      event: eventResult.rows[0],
      vendors: vendors.rows,
      deadlines: deadlines.rows,
      payments: payments.rows,
      meetings: meetings.rows,
    });
  } catch (error) {
    next(error);
  }
};

// Create event
const createEvent = async (req, res, next) => {
  try {
    const { title, description, client_name, client_email, client_phone, event_date, event_end_date, event_time, venue, venue_address, budget, event_type, notes } = req.body;

    if (!title || !client_name || !event_date) {
      return res.status(400).json({ error: 'Judul, nama klien, dan tanggal event wajib diisi.' });
    }

    const id = uuidv4();
    const result = await queryWithTenant(req.user.tenantId,
      `INSERT INTO events (id, tenant_id, title, description, client_name, client_email, client_phone, event_date, event_end_date, event_time, venue, venue_address, budget, event_type, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [id, req.user.tenantId, title, description, client_name, client_email, client_phone, event_date, event_end_date, event_time, venue, venue_address, budget || 0, event_type || 'wedding', notes, req.user.userId]
    );

    res.status(201).json({ message: 'Event berhasil dibuat!', event: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update event
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ['title', 'description', 'client_name', 'client_email', 'client_phone', 'event_date', 'event_end_date', 'event_time', 'venue', 'venue_address', 'budget', 'actual_cost', 'status', 'event_type', 'notes'];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(fields[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diupdate.' });
    }

    values.push(id);
    const result = await queryWithTenant(req.user.tenantId,
      `UPDATE events SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event tidak ditemukan.' });
    }

    res.json({ message: 'Event berhasil diupdate!', event: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// Delete event
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await queryWithTenant(req.user.tenantId,
      'DELETE FROM events WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event tidak ditemukan.' });
    }

    res.json({ message: 'Event berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent, assignVendorToEvent };
