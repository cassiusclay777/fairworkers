const express = require('express');
const FairPaymentSystem = require('../models/FairPaymentSystem');
const router = express.Router();

const paymentSystem = new FairPaymentSystem();

// Výpočet výdělku
router.post('/calculate', (req, res) => {
  try {
    const { servicePrice } = req.body;
    
    if (!servicePrice || servicePrice <= 0) {
      return res.status(400).json({ error: 'Neplatná cena služby' });
    }

    const earnings = paymentSystem.calculateEarnings(servicePrice);
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při výpočtu' });
  }
});

// Simulace měsíčního výdělku
router.post('/simulate-monthly', (req, res) => {
  try {
    const { services } = req.body;
    
    if (!Array.isArray(services)) {
      return res.status(400).json({ error: 'Neplatný formát služeb' });
    }

    const monthlyStats = paymentSystem.simulateMonthlyEarnings(services);
    res.json(monthlyStats);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při simulaci' });
  }
});

// Porovnání s konkurencí
router.post('/compare', (req, res) => {
  try {
    const { servicePrice } = req.body;
    
    if (!servicePrice || servicePrice <= 0) {
      return res.status(400).json({ error: 'Neplatná cena služby' });
    }

    const comparison = paymentSystem.compareWithCompetitors(servicePrice);
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: 'Chyba při porovnání' });
  }
});

module.exports = router;