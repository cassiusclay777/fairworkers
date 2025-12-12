const FairPaymentSystem = require('./FairPaymentSystem');

class EnhancedPaymentSystem extends FairPaymentSystem {
  constructor() {
    super();
    this.insuranceFundRate = 0.5; // 0.5% do fondu solidarity
    this.instantPayoutFee = 2; // 2% poplatek za okamžitou výplatu
    this.bonusThreshold = 5000; // Bonus za měsíční výdělek nad 5000 Kč
  }

  // Rozšířený výpočet s fondem solidarity
  calculateEnhancedEarnings(servicePrice) {
    const baseEarnings = super.calculateEarnings(servicePrice);
    const insuranceContribution = servicePrice * (this.insuranceFundRate / 100);
    
    return {
      ...baseEarnings,
      insuranceContribution: Math.round(insuranceContribution),
      finalWorkerEarnings: Math.round(baseEarnings.workerEarnings - insuranceContribution),
      insuranceFundRate: this.insuranceFundRate
    };
  }

  // Okamžitá výplata
  processInstantPayout(workerId, amount) {
    if (amount < this.minimumPayout) {
      return {
        success: false,
        error: `Minimální výplata je ${this.minimumPayout} Kč`
      };
    }

    const instantFee = amount * (this.instantPayoutFee / 100);
    const netAmount = amount - instantFee;

    return {
      success: true,
      workerId,
      requestedAmount: amount,
      instantFee: Math.round(instantFee),
      netAmount: Math.round(netAmount),
      processingTime: 'do 2 hodin',
      timestamp: new Date()
    };
  }

  // Bonusový systém
  calculateMonthlyBonus(totalMonthlyEarnings) {
    let bonus = 0;
    let bonusReason = '';

    if (totalMonthlyEarnings > 20000) {
      bonus = totalMonthlyEarnings * 0.05; // 5% bonus
      bonusReason = 'Výborný měsíční výkon';
    } else if (totalMonthlyEarnings > this.bonusThreshold) {
      bonus = totalMonthlyEarnings * 0.02; // 2% bonus
      bonusReason = 'Dobrý měsíční výkon';
    }

    return {
      eligible: bonus > 0,
      bonusAmount: Math.round(bonus),
      bonusReason,
      totalWithBonus: Math.round(totalMonthlyEarnings + bonus)
    };
  }

  // Simulace dlouhodobého výdělku
  simulateLongTermEarnings(monthlyServices, months = 12) {
    const monthlyData = [];
    let totalEarnings = 0;
    let totalBonus = 0;

    for (let month = 1; month <= months; month++) {
      const monthly = super.simulateMonthlyEarnings(monthlyServices);
      const bonus = this.calculateMonthlyBonus(monthly.totalWorkerEarnings);
      
      const monthData = {
        month,
        ...monthly,
        bonus,
        totalWithBonus: bonus.totalWithBonus
      };

      monthlyData.push(monthData);
      totalEarnings += monthly.totalWorkerEarnings;
      totalBonus += bonus.bonusAmount;
    }

    return {
      monthlyBreakdown: monthlyData,
      summary: {
        totalMonths: months,
        totalEarnings: Math.round(totalEarnings),
        totalBonus: Math.round(totalBonus),
        totalWithBonus: Math.round(totalEarnings + totalBonus),
        averageMonthly: Math.round(totalEarnings / months),
        averageMonthlyWithBonus: Math.round((totalEarnings + totalBonus) / months)
      }
    };
  }

  // Žádost o podporu z fondu solidarity
  requestInsuranceSupport(workerId, reason, amount, documentation = null) {
    const validReasons = [
      'zdravotní problémy',
      'rodinná situace', 
      'nečekané výdaje',
      'jiné důvody'
    ];

    if (!validReasons.includes(reason)) {
      return {
        success: false,
        error: `Neplatný důvod. Povolené důvody: ${validReasons.join(', ')}`
      };
    }

    const supportRequest = {
      requestId: `support_${Date.now()}`,
      workerId,
      reason,
      requestedAmount: amount,
      documentation,
      status: 'pending_review',
      submittedAt: new Date(),
      estimatedResponse: 'do 3 pracovních dnů'
    };

    return {
      success: true,
      ...supportRequest,
      message: 'Žádost byla podána a čeká na posouzení'
    };
  }

  // Přehled fondu solidarity
  getInsuranceFundOverview(contributions) {
    const totalContributions = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
    const availableForSupport = totalContributions * 0.8; // 80% dostupné pro podporu

    return {
      totalContributions: Math.round(totalContributions),
      availableForSupport: Math.round(availableForSupport),
      reservedForAdministration: Math.round(totalContributions * 0.2),
      supportedWorkers: contributions.filter(c => c.usedForSupport).length,
      averageSupportAmount: Math.round(availableForSupport / Math.max(contributions.length, 1))
    };
  }
}

module.exports = EnhancedPaymentSystem;