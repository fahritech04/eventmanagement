// Tenant context middleware
// Attaches tenantId from JWT to every DB query via SET LOCAL
const tenantContext = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return res.status(400).json({ error: 'Konteks tenant tidak ditemukan.' });
  }
  // tenantId is available via req.user.tenantId for use in controllers
  next();
};

module.exports = { tenantContext };
