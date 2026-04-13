const { queryWithTenant } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getVendors = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let sql = `SELECT v.*, 
                (SELECT COUNT(*) FROM event_vendors ev WHERE ev.vendor_id = v.id) as total_events
               FROM vendors v WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (category) {
      sql += ` AND v.category = $${idx++}`;
      params.push(category);
    }
    if (search) {
      sql += ` AND (v.name ILIKE $${idx} OR v.contact_person ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    sql += ' ORDER BY v.rating DESC, v.name ASC';

    const result = await queryWithTenant(req.user.tenantId, sql, params);
    res.json({ vendors: result.rows });
  } catch (error) {
    next(error);
  }
};

const getVendor = async (req, res, next) => {
  try {
    const result = await queryWithTenant(req.user.tenantId,
      'SELECT * FROM vendors WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor tidak ditemukan.' });
    }

    // Get vendor event history
    const events = await queryWithTenant(req.user.tenantId,
      `SELECT ev.*, e.title as event_title, e.event_date, e.status as event_status
       FROM event_vendors ev JOIN events e ON ev.event_id = e.id 
       WHERE ev.vendor_id = $1 ORDER BY e.event_date DESC`, [req.params.id]);

    res.json({ vendor: result.rows[0], events: events.rows });
  } catch (error) {
    next(error);
  }
};

const createVendor = async (req, res, next) => {
  try {
    const { name, category, contact_person, phone, email, address, description, rating } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Nama dan kategori vendor wajib diisi.' });
    }

    const id = uuidv4();
    const result = await queryWithTenant(req.user.tenantId,
      `INSERT INTO vendors (id, tenant_id, name, category, contact_person, phone, email, address, description, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, req.user.tenantId, name, category, contact_person, phone, email, address, description, rating || 0]
    );

    res.status(201).json({ message: 'Vendor berhasil ditambahkan!', vendor: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ['name', 'category', 'contact_person', 'phone', 'email', 'address', 'description', 'rating', 'is_active'];

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
      `UPDATE vendors SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor tidak ditemukan.' });
    }

    res.json({ message: 'Vendor berhasil diupdate!', vendor: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deleteVendor = async (req, res, next) => {
  try {
    const result = await queryWithTenant(req.user.tenantId,
      'DELETE FROM vendors WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor tidak ditemukan.' });
    }

    res.json({ message: 'Vendor berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVendors, getVendor, createVendor, updateVendor, deleteVendor };
