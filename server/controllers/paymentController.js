const { queryWithTenant } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getPayments = async (req, res, next) => {
  try {
    const { status, event_id } = req.query;
    let sql = `SELECT p.*, e.title as event_title, v.name as vendor_name
               FROM payments p 
               JOIN events e ON p.event_id = e.id 
               LEFT JOIN vendors v ON p.vendor_id = v.id 
               WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (status) {
      sql += ` AND p.status = $${idx++}`;
      params.push(status);
    }
    if (event_id) {
      sql += ` AND p.event_id = $${idx++}`;
      params.push(event_id);
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await queryWithTenant(req.user.tenantId, sql, params);
    res.json({ payments: result.rows });
  } catch (error) {
    next(error);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { event_id, vendor_id, amount, payment_date, payment_type, payment_method, status, invoice_number, notes } = req.body;
    if (!event_id || !amount) {
      return res.status(400).json({ error: 'Event dan jumlah pembayaran wajib diisi.' });
    }

    const id = uuidv4();
    const result = await queryWithTenant(req.user.tenantId,
      `INSERT INTO payments (id, tenant_id, event_id, vendor_id, amount, payment_date, payment_type, payment_method, status, invoice_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id, req.user.tenantId, event_id, vendor_id, amount, payment_date, payment_type || 'dp', payment_method, status || 'pending', invoice_number, notes]
    );

    res.status(201).json({ message: 'Pembayaran berhasil dicatat!', payment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const allowedFields = ['amount', 'payment_date', 'payment_type', 'payment_method', 'status', 'invoice_number', 'notes', 'proof_url'];

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
      `UPDATE payments SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan.' });
    }

    res.json({ message: 'Pembayaran berhasil diupdate!', payment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const result = await queryWithTenant(req.user.tenantId,
      'DELETE FROM payments WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan.' });
    }

    res.json({ message: 'Pembayaran berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

// Get payment summary
const getPaymentSummary = async (req, res, next) => {
  try {
    const result = await queryWithTenant(req.user.tenantId,
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as total_pending,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as total_overdue,
        COALESCE(SUM(amount), 0) as total_all,
        COUNT(*) as total_transactions
       FROM payments`, []);

    res.json({ summary: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPayments, createPayment, updatePayment, deletePayment, getPaymentSummary };
