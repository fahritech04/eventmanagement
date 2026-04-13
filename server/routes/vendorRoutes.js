const express = require('express');
const { getVendors, getVendor, createVendor, updateVendor, deleteVendor } = require('../controllers/vendorController');
const { auth } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();

router.use(auth, tenantContext);

router.get('/', getVendors);
router.get('/:id', getVendor);
router.post('/', createVendor);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

module.exports = router;
