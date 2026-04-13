const { queryWithTenant } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getDeadlines = async (req, res, next) => {
  try {
    const { status, priority, event_id } = req.query;
    let sql = `SELECT d.*, e.title as event_title, e.client_name, e.event_date
               FROM deadlines d JOIN events e ON d.event_id = e.id WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) {
      sql += ` AND d.status = $${idx++}`;
      params.push(status);
    }
    if (priority) {
      sql += ` AND d.priority = $${idx++}`;
      params.push(priority);
    }
    if (event_id) {
      sql += ` AND d.event_id = $${idx++}`;
      params.push(event_id);
    }

    sql += ' ORDER BY d.due_date ASC';

    const result = await queryWithTenant(req.user.tenantId, sql, params);
    res.json({ deadlines: result.rows });
  } catch (error) {
    next(error);
  }
};

const createDeadline = async (req, res, next) => {
  try {
    const { event_id, title, description, due_date, priority, assigned_to } = req.body;
    if (!event_id || !title || !due_date) {
      return res.status(400).json({ error: 'Event, judul, dan tanggal jatuh tempo wajib diisi.' });
    }

    const id = uuidv4();
    const result = await queryWithTenant(req.user.tenantId,
      `INSERT INTO deadlines (id, tenant_id, event_id, title, description, due_date, priority, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, req.user.tenantId, event_id, title, description, due_date, priority || 'medium', assigned_to]
    );

    res.status(201).json({ message: 'Deadline berhasil dibuat!', deadline: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateDeadline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ['title', 'description', 'due_date', 'priority', 'status', 'assigned_to'];

    const updates = [];
    const values = [];
    let idx = 1;

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(fields[field]);
      }
    }

    // If status changed to completed, set completed_at
    if (fields.status === 'completed') {
      updates.push(`completed_at = NOW()`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diupdate.' });
    }

    values.push(id);
    const result = await queryWithTenant(req.user.tenantId,
      `UPDATE deadlines SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deadline tidak ditemukan.' });
    }

    res.json({ message: 'Deadline berhasil diupdate!', deadline: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteDeadline = async (req, res, next) => {
  try {
    const result = await queryWithTenant(req.user.tenantId,
      'DELETE FROM deadlines WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deadline tidak ditemukan.' });
    }

    res.json({ message: 'Deadline berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDeadlines, createDeadline, updateDeadline, deleteDeadline };
