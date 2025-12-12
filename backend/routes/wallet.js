const express = require('express');
const router = express.Router();
const { sequelize, Wallet, Transaction, User } = require('../db-models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/wallet - Získat info o peněžence
router.get('/', authenticateToken, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({
      where: { user_id: req.user.id }
    });

    // Vytvořit peněženku pokud neexistuje
    if (!wallet) {
      wallet = await Wallet.create({
        user_id: req.user.id,
        balance: 0.00,
        currency: 'CZK'
      });
    }

    res.json({
      success: true,
      wallet: {
        balance: parseFloat(wallet.balance),
        total_deposited: parseFloat(wallet.total_deposited),
        total_spent: parseFloat(wallet.total_spent),
        currency: wallet.currency
      }
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání peněženky'
    });
  }
});

// POST /api/wallet/topup - Dobít peněženku (redirect to CCBill)
router.post('/topup', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { amount } = req.body;

    // Input sanitization - parse and validate amount
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Částka musí být kladné číslo'
      });
    }

    // Max 50 000 Kč per transakce
    if (parsedAmount > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Maximální částka pro dobití je 50 000 Kč'
      });
    }

    // Získat peněženku
    let wallet = await Wallet.findOne({
      where: { user_id: req.user.id },
      transaction: t
    });

    if (!wallet) {
      wallet = await Wallet.create({
        user_id: req.user.id,
        balance: 0.00,
        currency: 'CZK'
      }, { transaction: t });
    }

    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore + parsedAmount;

    // Vytvořit transakci
    const transaction = await Transaction.create({
      user_id: req.user.id,
      type: 'deposit',
      amount: parsedAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      status: 'completed', // V reálu by bylo 'pending' dokud CCBill nepotvrdí
      description: `Dobití peněženky: ${parsedAmount} Kč`,
      payment_provider: 'mock', // Později 'ccbill'
      payment_id: `mock_${Date.now()}`
    }, { transaction: t });

    // Aktualizovat peněženku
    await wallet.update({
      balance: balanceAfter,
      total_deposited: parseFloat(wallet.total_deposited) + parsedAmount
    }, { transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Peněženka úspěšně dobita!',
      wallet: {
        balance: balanceAfter,
        currency: wallet.currency
      },
      transaction: {
        id: transaction.id,
        amount: parseFloat(transaction.amount),
        type: transaction.type,
        created_at: transaction.created_at
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Topup error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při dobíjení peněženky'
    });
  }
});

// GET /api/wallet/transactions - Historie transakcí
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, type } = req.query;

    const whereClause = { user_id: req.user.id };
    if (type) {
      whereClause.type = type;
    }

    const transactions = await Transaction.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Transaction.count({ where: whereClause });

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        balance_before: parseFloat(t.balance_before),
        balance_after: parseFloat(t.balance_after),
        status: t.status,
        description: t.description,
        created_at: t.created_at
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání transakcí'
    });
  }
});

// GET /api/wallet/balance - Pouze balance (rychlý endpoint)
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      where: { user_id: req.user.id },
      attributes: ['balance', 'currency']
    });

    if (!wallet) {
      return res.json({
        success: true,
        balance: 0.00,
        currency: 'CZK'
      });
    }

    res.json({
      success: true,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání zůstatku'
    });
  }
});

module.exports = router;
