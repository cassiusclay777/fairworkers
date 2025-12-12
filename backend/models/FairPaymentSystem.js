class FairPaymentSystem {
  constructor() {
    this.transparentCommission = 15; // Férová 15% provize
    this.payoutDays = 7;
    this.minimumPayout = 500; // Minimální výplata 500 Kč
  }

  // Výpočet výdělku pracovníka
  calculateEarnings(servicePrice) {
    const commission = servicePrice * (this.transparentCommission / 100);
    const workerEarnings = servicePrice - commission;
    
    return {
      servicePrice,
      commission: Math.round(commission),
      workerEarnings: Math.round(workerEarnings),
      commissionRate: this.transparentCommission,
      payoutDays: this.payoutDays
    };
  }

  // Simulace měsíčního výdělku
  simulateMonthlyEarnings(services) {
    let totalRevenue = 0;
    let totalCommission = 0;
    let totalWorkerEarnings = 0;

    services.forEach(service => {
      const earnings = this.calculateEarnings(service.price);
      totalRevenue += service.price;
      totalCommission += earnings.commission;
      totalWorkerEarnings += earnings.workerEarnings;
    });

    return {
      totalRevenue: Math.round(totalRevenue),
      totalCommission: Math.round(totalCommission),
      totalWorkerEarnings: Math.round(totalWorkerEarnings),
      averageCommissionRate: this.transparentCommission,
      servicesCount: services.length
    };
  }

  // Porovnání s konkurencí
  compareWithCompetitors(servicePrice) {
    const ourSystem = this.calculateEarnings(servicePrice);
    
    // Hypotetické konkurenční systémy
    const competitors = {
      amateri: {
        name: 'Amateri.com',
        commissionRate: 40, // Odhad na základě zkušeností
        workerEarnings: Math.round(servicePrice * 0.6)
      },
      beznySystem: {
        name: 'Běžný systém',
        commissionRate: 30,
        workerEarnings: Math.round(servicePrice * 0.7)
      }
    };

    return {
      ourSystem,
      competitors,
      advantage: Math.round(ourSystem.workerEarnings - competitors.amateri.workerEarnings)
    };
  }

  // Kontrola minimální výplaty
  checkPayoutEligibility(earnings) {
    return earnings >= this.minimumPayout;
  }
}

module.exports = FairPaymentSystem;