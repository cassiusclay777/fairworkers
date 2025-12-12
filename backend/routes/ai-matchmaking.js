const express = require('express');
const router = express.Router();
const AIMatchmaking = require('../services/AIMatchmaking');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { MatchmakingPreference, MatchmakingFeedback } = require('../db-models');

// Inicializace AI Matchmaking služby
const aiMatchmaking = new AIMatchmaking();

/**
 * GET /api/ai/matchmaking
 * Hlavní endpoint pro AI matchmaking
 */
router.get('/matchmaking', 
  authenticateToken, 
  requireRole('client'),
  async (req, res) => {
    try {
      const { preferences } = req.query;
      
      let parsedPreferences = {};
      if (preferences) {
        try {
          parsedPreferences = JSON.parse(preferences);
        } catch (e) {
          console.warn('Invalid preferences format:', e);
        }
      }

      const matches = await aiMatchmaking.findPerfectMatches(
        req.user.id, 
        parsedPreferences
      );

      res.json({
        success: true,
        matches: matches.map(match => ({
          worker: {
            id: match.worker.id,
            username: match.worker.username,
            display_name: match.worker.display_name,
            avatar_url: match.worker.avatar_url,
            bio: match.worker.bio,
            location: match.worker.workerProfile?.location,
            hourly_rate: match.worker.workerProfile?.hourly_rate,
            rating: match.worker.workerProfile?.average_rating,
            total_bookings: match.worker.workerProfile?.total_bookings,
            is_available: match.worker.workerProfile?.is_available
          },
          compatibility: {
            score: Math.round(match.compatibilityScore * 100),
            reasons: match.matchReasons,
            confidence: Math.round(match.confidence * 100)
          },
          matchQuality: this.getMatchQualityLabel(match.compatibilityScore),
          recommended: match.compatibilityScore > 0.8
        })),
        totalMatches: matches.length,
        algorithmVersion: '1.0',
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('AI Matchmaking API error:', error);
      res.status(500).json({
        success: false,
        message: 'Chyba při hledání matchů',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/ai/matchmaking/preferences
 * Uložit preference pro lepší matchmaking
 */
router.post('/preferences',
  authenticateToken,
  requireRole('client'),
  async (req, res) => {
    try {
      const { preferences } = req.body;

      // Uložit preference do databáze
      const [userPreference, created] = await MatchmakingPreference.upsert({
        user_id: req.user.id,
        preferences: preferences,
        updated_at: new Date()
      }, {
        returning: true
      });

      res.json({
        success: true,
        message: created ? 'Preference úspěšně vytvořeny' : 'Preference úspěšně aktualizovány',
        preferences: userPreference.preferences
      });

    } catch (error) {
      console.error('Save preferences error:', error);
      res.status(400).json({
        success: false,
        message: 'Chyba při ukládání preferencí',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/ai/matchmaking/insights
 * Získat insights o matchmaking preferencích
 */
router.get('/insights',
  authenticateToken,
  requireRole('client'),
  async (req, res) => {
    try {
      const insights = await aiMatchmaking.generateClientInsights(req.user.id);

      res.json({
        success: true,
        insights: {
          preferredCategories: insights.favoriteCategories,
          averageSpending: insights.averageBudget,
          favoriteLocations: insights.preferredLocations,
          bookingPatterns: insights.bookingPatterns,
          successRate: insights.successRate,
          recommendations: this.generatePersonalizedRecommendations(insights)
        }
      });

    } catch (error) {
      console.error('Get insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Chyba při načítání insights',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/ai/matchmaking/workers/:workerId/compatibility
 * Zkontrolovat kompatibilitu s konkrétní pracovnicí
 */
router.get('/workers/:workerId/compatibility',
  authenticateToken,
  requireRole('client'),
  async (req, res) => {
    try {
      const { workerId } = req.params;
      
      const compatibility = await aiMatchmaking.calculateWorkerCompatibility(
        req.user.id,
        workerId
      );

      res.json({
        success: true,
        compatibility: {
          score: Math.round(compatibility.score * 100),
          reasons: compatibility.reasons,
          strengths: compatibility.strengths,
          considerations: compatibility.considerations,
          matchLevel: this.getCompatibilityLevel(compatibility.score)
        }
      });

    } catch (error) {
      console.error('Worker compatibility check error:', error);
      res.status(500).json({
        success: false,
        message: 'Chyba při kontrole kompatibility',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/ai/matchmaking/feedback
 * Sbírat feedback pro vylepšení algoritmu
 */
router.post('/feedback',
  authenticateToken,
  async (req, res) => {
    try {
      const { workerId, matchScore, feedback } = req.body;

      if (!workerId || !feedback) {
        return res.status(400).json({
          success: false,
          message: 'Chybí povinná data: workerId, feedback'
        });
      }

      // Uložit feedback do databáze
      await MatchmakingFeedback.create({
        user_id: req.user.id,
        worker_id: workerId,
        match_score: matchScore || 0,
        feedback: feedback // 'accept', 'reject', 'interested', 'not_interested'
      });

      res.json({
        success: true,
        message: 'Feedback úspěšně odeslán. Děkujeme!',
        improvesAlgorithm: true
      });

    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(400).json({
        success: false,
        message: 'Chyba při odesílání feedbacku',
        error: error.message
      });
    }
  }
);

// Pomocné metody

/**
 * Získat popisek kvality matchu
 */
router.getMatchQualityLabel = function(score) {
  if (score >= 0.9) return 'Perfektní match 🎯';
  if (score >= 0.8) return 'Vynikající match ⭐';
  if (score >= 0.7) return 'Velmi dobrý match 👍';
  if (score >= 0.6) return 'Dobrý match ✅';
  if (score >= 0.5) return 'Slušný match ➕';
  return 'Základní match 🔍';
};

/**
 * Validovat preference
 */
router.validatePreferences = function(preferences) {
  const validPreferences = {};
  
  if (preferences.location) {
    validPreferences.location = String(preferences.location).slice(0, 100);
  }
  
  if (preferences.minRating !== undefined) {
    const rating = Math.max(1, Math.min(5, Number(preferences.minRating)));
    validPreferences.minRating = rating;
  }
  
  if (preferences.maxPrice !== undefined) {
    const price = Math.max(500, Math.min(50000, Number(preferences.maxPrice)));
    validPreferences.maxPrice = price;
  }
  
  if (preferences.language) {
    validPreferences.language = String(preferences.language).slice(0, 50);
  }
  
  if (preferences.serviceTypes && Array.isArray(preferences.serviceTypes)) {
    validPreferences.serviceTypes = preferences.serviceTypes.slice(0, 10);
  }
  
  if (preferences.verifiedOnly !== undefined) {
    validPreferences.verifiedOnly = Boolean(preferences.verifiedOnly);
  }
  
  return validPreferences;
};

/**
 * Generovat personalizovaná doporučení
 */
router.generatePersonalizedRecommendations = function(insights) {
  const recommendations = [];
  
  if (insights.successRate < 0.7) {
    recommendations.push({
      type: 'success_improvement',
      title: 'Zvyšte úspěšnost matchů',
      message: 'Zkuste upravit své preference pro lepší výsledky',
      action: 'adjust_preferences'
    });
  }
  
  if (insights.averageBudget && insights.averageBudget < 1500) {
    recommendations.push({
      type: 'budget_optimization',
      title: 'Optimalizujte rozpočet',
      message: 'Mírné zvýšení rozpočtu může výrazně zlepšit kvalitu matchů',
      action: 'increase_budget'
    });
  }
  
  if (insights.preferredLocations && insights.preferredLocations.length === 1) {
    recommendations.push({
      type: 'location_expansion',
      title: 'Rozšiřte lokality',
      message: 'Přidání blízkých lokalit zvýší počet dostupných matchů',
      action: 'add_locations'
    });
  }
  
  return recommendations.slice(0, 3);
};

/**
 * Získat úroveň kompatibility
 */
router.getCompatibilityLevel = function(score) {
  if (score >= 0.9) return 'perfect';
  if (score >= 0.8) return 'excellent';
  if (score >= 0.7) return 'very_good';
  if (score >= 0.6) return 'good';
  if (score >= 0.5) return 'fair';
  return 'basic';
};

module.exports = router;
