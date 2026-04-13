const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');

// Register tenant + first user
const register = async (req, res, next) => {
  try {
    const { tenantName, tenantSlug, name, email, password, phone } = req.body;

    if (!tenantName || !tenantSlug || !name || !email || !password) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    // Check if email already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar.' });
    }

    // Check if slug already exists
    const existingTenant = await query('SELECT id FROM tenants WHERE slug = $1', [tenantSlug]);
    if (existingTenant.rows.length > 0) {
      return res.status(409).json({ error: 'Slug organisasi sudah digunakan.' });
    }

    const tenantId = uuidv4();
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    // Create tenant
    await query(
      `INSERT INTO tenants (id, name, slug, email, phone) VALUES ($1, $2, $3, $4, $5)`,
      [tenantId, tenantName, tenantSlug, email, phone || null]
    );

    // Create owner user
    await query(
      `INSERT INTO users (id, tenant_id, email, password_hash, name, role, phone) VALUES ($1, $2, $3, $4, $5, 'owner', $6)`,
      [userId, tenantId, email, passwordHash, name, phone || null]
    );

    // Generate JWT
    const token = jwt.sign(
      { userId, tenantId, email, role: 'owner', name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user: { id: userId, name, email, role: 'owner' },
      tenant: { id: tenantId, name: tenantName, slug: tenantSlug },
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi.' });
    }

    const result = await query(
      `SELECT u.id, u.tenant_id, u.email, u.password_hash, u.name, u.role, 
              t.name as tenant_name, t.slug as tenant_slug
       FROM users u JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.email = $1 AND u.is_active = true AND t.is_active = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login berhasil!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tenant: { id: user.tenant_id, name: user.tenant_name, slug: user.tenant_slug },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.tenant_id, u.email, u.name, u.role, u.phone, u.avatar_url, u.last_login,
              t.name as tenant_name, t.slug as tenant_slug, t.plan as tenant_plan
       FROM users u JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
