const { queryWithTenant } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getMeetings = async (req, res, next) => {
  try {
    const { status, event_id } = req.query;
    let sql = `SELECT m.*, e.title as event_title, e.client_name
               FROM meetings m 
               LEFT JOIN events e ON m.event_id = e.id 
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) {
      sql += ` AND m.status = $${idx++}`;
      params.push(status);
    }
    if (event_id) {
      sql += ` AND m.event_id = $${idx++}`;
      params.push(event_id);
    }

    sql += ' ORDER BY m.meeting_date ASC';

    const result = await queryWithTenant(req.user.tenantId, sql, params);
    res.json({ meetings: result.rows });
  } catch (error) {
    next(error);
  }
};

const createMeeting = async (req, res, next) => {
  try {
    const { event_id, title, description, meeting_date, duration_minutes, location, meeting_type, meeting_link, attendees, notes } = req.body;

    if (!title || !meeting_date) {
      return res.status(400).json({ error: 'Judul dan tanggal meeting wajib diisi.' });
    }

    const id = uuidv4();
    const result = await queryWithTenant(req.user.tenantId,
      `INSERT INTO meetings (id, tenant_id, event_id, title, description, meeting_date, duration_minutes, location, meeting_type, meeting_link, attendees, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [id, req.user.tenantId, event_id, title, description, meeting_date, duration_minutes || 60, location, meeting_type || 'offline', meeting_link, attendees || [], notes]
    );

    res.status(201).json({ message: 'Meeting berhasil dijadwalkan!', meeting: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ['event_id', 'title', 'description', 'meeting_date', 'duration_minutes', 'location', 'meeting_type', 'meeting_link', 'attendees', 'status', 'notes'];

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
      `UPDATE meetings SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting tidak ditemukan.' });
    }

    res.json({ message: 'Meeting berhasil diupdate!', meeting: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const result = await queryWithTenant(req.user.tenantId,
      'DELETE FROM meetings WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting tidak ditemukan.' });
    }

    res.json({ message: 'Meeting berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMeetings, createMeeting, updateMeeting, deleteMeeting };
