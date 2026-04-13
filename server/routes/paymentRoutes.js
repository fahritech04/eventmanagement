const express = require('express');
const { getPayments, createPayment, updatePayment, deletePayment, getPaymentSummary } = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenantContext');

const router = express.Router();

router.use(auth, tenantContext);

router.get('/summary', getPaymentSummary);
router.get('/', getPayments);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;
