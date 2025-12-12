const crypto = require('crypto');
const axios = require('axios');

const CCBILL_API_URL = 'https://api.ccbill.com/api/3.0';
const CCBILL_BILLING_URL = 'https://billing.ccbill.com/do/express/express.php';

// Verify incoming webhook signature from CCBill
const verifyCCBillSignature = (req) => {
  const { clientAccno, clientSubacc, initialPrice, salt } = req.body;
  const hashStr = `${clientAccno}:${clientSubacc}:${initialPrice}`;
  const signature = crypto.createHmac('md5', process.env.CCBILL_SALT)
    .update(hashStr)
    .digest('hex');

  return signature === req.headers['x-ccbill-signature'];
};

// Generate CCBill subscription/transaction link
const generateCCBillLink = async (userId, amount, description, subscriptionDays = 0) => {
  const params = {
    clientAccno: process.env.CCBILL_CLIENT_ACCOUNT,
    clientSubacc: process.env.CCBILL_SUBACC,
    currency: 'CZK', // Czech Koruna
    initialPrice: amount,
    recurringPrice: subscriptionDays ? amount : 0,
    recurringPeriod: subscriptionDays || 0,
    description: description,
    redirectUrl: `${process.env.API_URL}/api/payments/ccbill/success`,
    declineUrl: `${process.env.API_URL}/api/payments/ccbill/decline`,
    salt: process.env.CCBILL_SALT,
    userId: userId, // Custom field for tracking
    anonymous: 1, // Anonymous billing
    disableOtherCC: 0, // Allow other payment methods
  };

  // Generate signature
  const hashStr = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&');

  const signature = crypto.createHmac('sha256', process.env.CCBILL_SALT)
    .update(hashStr)
    .digest('hex');

  const url = `${CCBILL_BILLING_URL}?${new URLSearchParams(params).toString()}&signature=${signature}`;
  return url;
};

// Verify completed payment via CCBill API
const verifyPaymentWithCCBill = async (transactionId) => {
  try {
    const response = await axios.get(
      `${CCBILL_API_URL}/transactions/${transactionId}`,
      {
        auth: {
          username: process.env.CCBILL_API_KEY,
          password: process.env.CCBILL_API_SECRET,
        }
      }
    );
    return response.data.transaction;
  } catch (error) {
    console.error('CCBill verification error:', error);
    return null;
  }
};

module.exports = {
  verifyCCBillSignature,
  generateCCBillLink,
  verifyPaymentWithCCBill,
};
