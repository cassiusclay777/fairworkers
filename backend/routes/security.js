const express = require('express');
const SecuritySystem = require('../models/SecuritySystem');

const router = express.Router();
const securitySystem = new SecuritySystem();

// Tísňové tlačítko
router.post('/emergency', async (req, res) => {
  try {
    const { workerId, location, details } = req.body;
    
    if (!workerId || !location) {
      return res.status(400).json({
        error: 'Chybí povinná data: workerId a location'
      });
    }

    const result = await securitySystem.triggerEmergencyAlert(workerId, location, details);
    
    res.json({
      success: true,
      ...result,
      message: 'Tísňový signál byl odeslán. Pomoc je na cestě.'
    });
  } catch (error) {
    console.error('Chyba při tísňovém volání:', error);
    res.status(500).json({
      error: 'Nepodařilo se odeslat tísňový signál'
    });
  }
});

// Naplánování bezpečnostní kontroly
router.post('/safety-check/schedule', (req, res) => {
  try {
    const { workerId, appointmentTime, duration } = req.body;
    
    if (!workerId || !appointmentTime) {
      return res.status(400).json({
        error: 'Chybí povinná data: workerId a appointmentTime'
      });
    }

    const result = securitySystem.scheduleSafetyCheck(workerId, appointmentTime, duration);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Chyba při plánování kontroly:', error);
    res.status(500).json({
      error: 'Nepodařilo se naplánovat bezpečnostní kontrolu'
    });
  }
});

// Provedení bezpečnostní kontroly
router.post('/safety-check/perform', async (req, res) => {
  try {
    const { workerId } = req.body;
    
    if (!workerId) {
      return res.status(400).json({
        error: 'Chybí workerId'
      });
    }

    const result = await securitySystem.performSafetyCheck(workerId);
    
    res.json({
      success: true,
      ...result,
      message: 'Bezpečnostní kontrola byla zahájena'
    });
  } catch (error) {
    console.error('Chyba při bezpečnostní kontrole:', error);
    res.status(500).json({
      error: 'Nepodařilo se provést bezpečnostní kontrolu'
    });
  }
});

// Anonymní nahlášení
router.post('/report/anonymous', (req, res) => {
  try {
    const { issueType, description, location } = req.body;
    
    if (!issueType || !description) {
      return res.status(400).json({
        error: 'Chybí povinná data: issueType a description'
      });
    }

    const result = securitySystem.submitAnonymousReport(issueType, description, location);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Chyba při anonymním nahlášení:', error);
    res.status(500).json({
      error: 'Nepodařilo se odeslat anonymní hlášení'
    });
  }
});

// Získání bezpečnostních zdrojů
router.get('/resources', (req, res) => {
  try {
    const resources = securitySystem.getSafetyResources();
    
    res.json({
      success: true,
      ...resources
    });
  } catch (error) {
    console.error('Chyba při získávání zdrojů:', error);
    res.status(500).json({
      error: 'Nepodařilo se načíst bezpečnostní zdroje'
    });
  }
});

// Stav bezpečnostního systému
router.get('/status', (req, res) => {
  res.json({
    success: true,
    system: 'FairWorkers Security System',
    status: 'active',
    emergencyContacts: securitySystem.emergencyContacts,
    features: [
      'Tísňové tlačítko',
      'Bezpečnostní kontroly',
      'Anonymní nahlášení',
      'Bezpečnostní zdroje'
    ],
    lastUpdated: new Date().toISOString()
  });
});

module.exports = router;