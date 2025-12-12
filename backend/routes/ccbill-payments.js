const express = require('express');
const router = express.Router();
const { User, Wallet, Transaction, WorshipFund } = require('../db-models');
const {
  verifyCCBillSignature,
  generateCCBillLink,
  verifyPaymentWithCCBill
} = require('../middleware/ccbill');
const { authenticate } = require('../middleware/auth');
const cron = require('node-cron');
const axios = require('axios');

// 1. INITIATE PAYMENT - redirect ke CCBill
router.post('/initialize', authenticate, async (req, res) => {
  try {
    const { amount, type, serviceId } = req.body; // type: 'credit_topup' | 'booking_deposit'

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Min amount: 100 CZK' });
    }

    // Create pending transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      amount: amount,
      type: type,
      status: 'pending',
      gateway: 'ccbill',
      serviceId: serviceId,
    });

    // Generate CCBill payment link
    const paymentUrl = await generateCCBillLink(
      req.user.id,
      amount,
      `FairWorkers ${type}`,
      0 // One-time payment, no recurring
    );

    res.json({
      transactionId: transaction.id,
      paymentUrl: paymentUrl,
      amount: amount,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ error: 'Payment setup failed' });
  }
});

// 2. SUCCESS REDIRECT - CCBill redirects here after payment
router.get('/success', async (req, res) => {
  try {
    const { transactionId, approval } = req.query;

    if (!approval) {
      return res.redirect(`${process.env.FRONTEND_URL}/payments/failed`);
    }

    // Verify payment with CCBill API
    const payment = await verifyPaymentWithCCBill(transactionId);
    if (!payment || payment.status !== 'approved') {
      return res.redirect(`${process.env.FRONTEND_URL}/payments/failed`);
    }

    // Update transaction
    const transaction = await Transaction.findByPk(transactionId);
    await transaction.update({ status: 'completed', ccbillRef: payment.id });

    // Credit wallet
    const wallet = await Wallet.findOne({ where: { userId: transaction.userId } });
    await wallet.increment('balance', { by: transaction.amount });

    // 0.5% solidarity fund
    const solidarityAmount = Math.round(transaction.amount * 0.005);
    await WorshipFund.create({
      amount: solidarityAmount,
      fromTransactionId: transaction.id,
      type: 'platform_fee',
    });

    res.redirect(`${process.env.FRONTEND_URL}/payments/success?transactionId=${transactionId}`);
  } catch (error) {
    console.error('Payment success error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payments/error`);
  }
});

// 3. DECLINE REDIRECT
router.get('/decline', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payments/declined`);
});

// 4. WEBHOOK - CCBill sends updates here
router.post('/webhook', async (req, res) => {
  try {
    if (!verifyCCBillSignature(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { eventType, transactionId, amount, status } = req.body;

    if (eventType === 'charge_approved') {
      const transaction = await Transaction.findByPk(transactionId);
      if (transaction && transaction.status === 'pending') {
        await transaction.update({ status: 'completed' });

        // Credit wallet immediately
        const wallet = await Wallet.findOne({ where: { userId: transaction.userId } });
        await wallet.increment('balance', { by: amount });
      }
    }

    if (eventType === 'charge_declined') {
      await Transaction.update(
        { status: 'failed' },
        { where: { id: transactionId } }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// 5. GET TRANSACTION STATUS
router.get('/:transactionId', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.transactionId);

    if (!transaction || transaction.userId !== req.user.id) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// 6. SCHEDULED PAYOUT (cron) - Every 7 days (Sunday 2 AM)
cron.schedule('0 2 * * 0', async () => {
  console.log('[PAYOUT] Running weekly payout cycle...');
  try {
    const workers = await User.findAll({ where: { role: 'worker' } });

    for (const worker of workers) {
      const wallet = await Wallet.findOne({ where: { userId: worker.id } });

      if (wallet.pending_balance >= 500) { // Min 500 CZK for payout
        // Create payout transaction via CCBill API
        const payout = await axios.post(
          `${process.env.CCBILL_API_URL || 'https://api.ccbill.com/api/3.0'}/payouts`,
          {
            amount: wallet.pending_balance,
            bankAccount: worker.bankAccount, // Worker must set this in profile
            currency: 'CZK',
          },
          {
            auth: {
              username: process.env.CCBILL_API_KEY,
              password: process.env.CCBILL_API_SECRET,
            }
          }
        );

        // Update wallet
        await wallet.decrement('pending_balance', { by: wallet.pending_balance });
        await Transaction.create({
          userId: worker.id,
          amount: wallet.pending_balance,
          type: 'payout',
          status: 'completed',
          gateway: 'ccbill',
          ccbillRef: payout.data.payoutId,
        });

        console.log(`[PAYOUT] Paid out ${wallet.pending_balance} CZK to worker ${worker.id}`);
      }
    }
  } catch (error) {
    console.error('[PAYOUT] Error:', error);
  }
});

module.exports = router;
 
