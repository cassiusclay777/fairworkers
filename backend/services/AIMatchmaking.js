const { User, WorkerProfile, Booking, Rating } = require('../db-models');

class AIMatchmaking {
  constructor() {
    this.similarityWeights = {
      serviceType: 0.3,
      priceRange: 0.25,
      location: 0.2,
      rating: 0.15,
      availability: 0.1
    };
  }

  /**
   * Hlavní funkce pro nalezení nejlepších matchů
   */
  async findPerfectMatches(clientId, preferences = {}) {
    try {
      // 1. Získat data klienta a jeho historii
      const clientData = await this.getClientData(clientId);
      const clientHistory = await this.getClientHistory(clientId);
      
      // 2. Získat všechny dostupné pracovnice
      const availableWorkers = await this.getAvailableWorkers();
      
      // 3. Spočítat kompatibilitu pro každou pracovnici
      const matches = await Promise.all(
        availableWorkers.map(async (worker) => {
          const compatibility = await this.calculateCompatibility(
            clientData,
            clientHistory,
            worker,
            preferences
          );
          
          return {
            worker,
            compatibilityScore: compatibility.score,
            matchReasons: compatibility.reasons,
            confidence: compatibility.confidence
          };
        })
      );

      // 4. Seřadit podle kompatibility a vrátit top výsledky
      return matches
        .filter(match => match.compatibilityScore > 0.3) // Minimální threshold
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 10); // Top 10 matchů
      
    } catch (error) {
      console.error('AI Matchmaking error:', error);
      throw new Error('Failed to find matches');
    }
  }

  /**
   * Získat data klienta
   */
  async getClientData(clientId) {
    const client = await User.findOne({
      where: { id: clientId, role: 'client' },
      include: [{
        model: WorkerProfile,
        as: 'workerProfile',
        required: false
      }]
    });

    if (!client) {
      throw new Error('Client not found');
    }

    return {
      id: client.id,
      preferences: this.extractPreferencesFromProfile(client),
      location: client.location || 'Praha', // Default location
      budgetRange: this.calculateBudgetRange(client)
    };
  }

  /**
   * Získat historii klienta
   */
  async getClientHistory(clientId) {
    const bookings = await Booking.findAll({
      where: { client_id: clientId },
      include: [{
        model: User,
        as: 'worker',
        include: [{
          model: WorkerProfile,
          as: 'workerProfile'
        }]
      }],
      limit: 50, // Posledních 50 rezervací
      order: [['created_at', 'DESC']]
    });

    const ratings = await Rating.findAll({
      where: { client_id: clientId },
      include: [{
        model: User,
        as: 'worker'
      }]
    });

    return {
      bookings: bookings.map(b => ({
        workerId: b.worker.id,
        serviceType: b.service_type,
        price: b.total_price,
        duration: b.duration_minutes,
        satisfaction: this.calculateSatisfaction(b, ratings)
      })),
      preferences: this.analyzeBookingPatterns(bookings),
      favoriteCategories: this.extractFavoriteCategories(bookings)
    };
  }

  /**
   * Získat dostupné pracovnice
   */
  async getAvailableWorkers() {
    return await User.findAll({
      where: { 
        role: 'worker', 
        status: 'active' 
      },
      include: [{
        model: WorkerProfile,
        as: 'workerProfile',
        where: {
          is_available: true,
          accepts_new_clients: true
        },
        required: true
      }],
      attributes: [
        'id', 'username', 'display_name', 'avatar_url', 'bio',
        'location', 'created_at'
      ]
    });
  }

  /**
   * Hlavní algoritmus pro výpočet kompatibility
   */
  async calculateCompatibility(clientData, clientHistory, worker, preferences) {
    const scores = {
      serviceType: await this.calculateServiceTypeMatch(clientHistory, worker),
      priceRange: this.calculatePriceMatch(clientData, worker),
      location: this.calculateLocationMatch(clientData, worker),
      rating: this.calculateRatingMatch(worker),
      availability: await this.calculateAvailabilityMatch(worker),
      clientPreferences: this.calculatePreferenceMatch(preferences, worker)
    };

    // Weighted average
    const totalScore = Object.keys(scores).reduce((sum, key) => {
      return sum + (scores[key] * (this.similarityWeights[key] || 0.1));
    }, 0);

    // Normalize to 0-1
    const normalizedScore = Math.min(Math.max(totalScore, 0), 1);

    return {
      score: normalizedScore,
      reasons: this.generateMatchReasons(scores, worker),
      confidence: this.calculateConfidence(clientHistory, scores)
    };
  }

  /**
   * Matchování typu služby
   */
  async calculateServiceTypeMatch(clientHistory, worker) {
    if (!clientHistory.bookings.length) return 0.5; // Default pro nové klienty

    const workerServices = await this.getWorkerServices(worker.id);
    const clientFavoriteServices = clientHistory.favoriteCategories;
    
    const intersection = workerServices.filter(service => 
      clientFavoriteServices.includes(service.category)
    );

    return intersection.length / Math.max(clientFavoriteServices.length, 1);
  }

  /**
   * Matchování cenového rozsahu
   */
  calculatePriceMatch(clientData, worker) {
    const workerRate = worker.workerProfile?.hourly_rate || 1500;
    const clientBudget = clientData.budgetRange;
    
    if (workerRate >= clientBudget.min && workerRate <= clientBudget.max) {
      return 1.0; // Perfect match
    } else if (workerRate <= clientBudget.max * 1.2) {
      return 0.7; // Slightly above budget but acceptable
    } else {
      return 0.3; // Too expensive
    }
  }

  /**
   * Matchování lokality
   */
  calculateLocationMatch(clientData, worker) {
    const clientLocation = clientData.location;
    const workerLocation = worker.workerProfile?.location;
    
    if (!clientLocation || !workerLocation) return 0.5;
    
    if (clientLocation === workerLocation) return 1.0;
    if (this.areLocationsClose(clientLocation, workerLocation)) return 0.8;
    
    return 0.3;
  }

  /**
   * Matchování hodnocení
   */
  calculateRatingMatch(worker) {
    const rating = worker.workerProfile?.average_rating || 0;
    
    if (rating >= 4.5) return 1.0;
    if (rating >= 4.0) return 0.8;
    if (rating >= 3.5) return 0.6;
    return 0.4;
  }

  /**
   * Dostupnost pracovnice
   */
  async calculateAvailabilityMatch(worker) {
    // Zkontrolovat aktuální vytíženost
    const recentBookings = await Booking.count({
      where: { 
        worker_id: worker.id,
        status: ['confirmed', 'in_progress'],
        start_time: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Posledních 7 dní
        }
      }
    });

    if (recentBookings < 5) return 1.0; // Málo vytížená
    if (recentBookings < 15) return 0.7; // Středně vytížená
    return 0.3; // Velmi vytížená
  }

  /**
   * Matchování explicitních preferencí
   */
  calculatePreferenceMatch(preferences, worker) {
    if (!preferences || Object.keys(preferences).length === 0) return 0.5;

    let matchScore = 0;
    let criteriaCount = 0;

    if (preferences.language) {
      const workerLanguages = worker.workerProfile?.languages || [];
      if (workerLanguages.includes(preferences.language)) {
        matchScore += 1;
      }
      criteriaCount++;
    }

    if (preferences.minRating) {
      const workerRating = worker.workerProfile?.average_rating || 0;
      if (workerRating >= preferences.minRating) {
        matchScore += 1;
      }
      criteriaCount++;
    }

    if (preferences.verifiedOnly && worker.workerProfile?.verification_status === 'verified') {
      matchScore += 1;
      criteriaCount++;
    }

    return criteriaCount > 0 ? matchScore / criteriaCount : 0.5;
  }

  // Pomocné metody

  extractPreferencesFromProfile(client) {
    // Analyzovat profil klienta pro implicitní preference
    return {
      location: client.location,
      budget: client.budgetRange
    };
  }

  calculateBudgetRange(client) {
    // Analyzovat historii utrácení
    return {
      min: 500,
      max: 5000,
      preferred: 2000
    };
  }

  calculateSatisfaction(booking, ratings) {
    const rating = ratings.find(r => r.worker_id === booking.worker_id);
    return rating ? rating.rating / 5 : 0.8; // Default satisfaction
  }

  analyzeBookingPatterns(bookings) {
    const patterns = {
      preferredPriceRange: this.calculatePreferredPriceRange(bookings),
      favoriteTimes: this.analyzeFavoriteTimes(bookings),
      serviceDuration: this.calculateAverageDuration(bookings)
    };
    return patterns;
  }

  extractFavoriteCategories(bookings) {
    const categories = bookings.map(b => b.service_type).filter(Boolean);
    const frequency = {};
    categories.forEach(cat => {
      frequency[cat] = (frequency[cat] || 0) + 1;
    });
    
    return Object.keys(frequency)
      .sort((a, b) => frequency[b] - frequency[a])
      .slice(0, 3); // Top 3 kategorie
  }

  async getWorkerServices(workerId) {
    // Získat služby pracovnice
    const services = await Service.findAll({
      where: { worker_id: workerId, is_active: true }
    });
    
    return services.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      price: s.price
    }));
  }

  areLocationsClose(loc1, loc2) {
    const closeLocations = {
      'Praha': ['Praha', 'Středočeský kraj'],
      'Brno': ['Brno', 'Jihomoravský kraj'],
      'Ostrava': ['Ostrava', 'Moravskoslezský kraj']
    };
    
    return closeLocations[loc1]?.includes(loc2) || 
           closeLocations[loc2]?.includes(loc1) ||
           false;
  }

  generateMatchReasons(scores, worker) {
    const reasons = [];
    
    if (scores.serviceType > 0.8) {
      reasons.push('Specializace odpovídá vašim preferencím');
    }
    
    if (scores.priceRange > 0.8) {
      reasons.push('Cenově dostupná');
    }
    
    if (scores.location > 0.8) {
      reasons.push('Lokalita blízko vás');
    }
    
    if (scores.rating > 0.8) {
      reasons.push('Vysoké hodnocení od klientů');
    }
    
    if (scores.availability > 0.8) {
      reasons.push('Dostupná pro rychlé rezervace');
    }

    return reasons.slice(0, 3); // Max 3 důvody
  }

  calculateConfidence(clientHistory, scores) {
    const historyWeight = Math.min(clientHistory.bookings.length / 10, 1);
    const scoreVariance = this.calculateScoreVariance(scores);
    
    return (historyWeight * 0.7) + ((1 - scoreVariance) * 0.3);
  }

  calculateScoreVariance(scores) {
    const values = Object.values(scores);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  calculatePreferredPriceRange(bookings) {
    if (bookings.length === 0) return { min: 1000, max: 3000 };
    
    const prices = bookings.map(b => b.total_price).filter(p => p > 0);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return {
      min: Math.max(500, avg * 0.7),
      max: avg * 1.3
    };
  }

  analyzeFavoriteTimes(bookings) {
    // Analyzovat preferované časy rezervací
    const times = bookings.map(b => new Date(b.start_time).getHours());
    const frequency = {};
    times.forEach(hour => {
      frequency[hour] = (frequency[hour] || 0) + 1;
    });
    
    return Object.keys(frequency)
      .sort((a, b) => frequency[b] - frequency[a])
      .slice(0, 3)
      .map(h => parseInt(h));
  }

  calculateAverageDuration(bookings) {
    if (bookings.length === 0) return 60;
    
    const durations = bookings.map(b => b.duration_minutes).filter(d => d > 0);
    return durations.reduce((a, b) => a + b, 0) / durations.length;
  }
}

module.exports = AIMatchmaking;
