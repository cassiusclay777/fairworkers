class Worker {
  constructor(profile) {
    this.id = profile.id || generateId();
    this.username = profile.username;
    this.email = profile.email;
    this.verified = profile.verified || false;
    this.rating = profile.rating || 0;
    this.reviews = profile.reviews || [];
    this.services = profile.services || [];
    this.earnings = profile.earnings || 0;
    this.payouts = profile.payouts || [];
    this.createdAt = profile.createdAt || new Date();
    this.isActive = profile.isActive !== undefined ? profile.isActive : true;
  }

  // Přidání služby
  addService(service) {
    this.services.push({
      id: generateId(),
      name: service.name,
      price: service.price,
      description: service.description,
      duration: service.duration,
      category: service.category,
      createdAt: new Date()
    });
  }

  // Přidání recenze
  addReview(review) {
    this.reviews.push({
      id: generateId(),
      clientId: review.clientId,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date()
    });
    
    // Přepočet průměrného hodnocení
    this.calculateRating();
  }

  // Výpočet průměrného hodnocení
  calculateRating() {
    if (this.reviews.length === 0) {
      this.rating = 0;
      return;
    }
    
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = (total / this.reviews.length).toFixed(1);
  }

  // Přidání výdělku
  addEarnings(amount, serviceId) {
    this.earnings += amount;
    
    this.payouts.push({
      id: generateId(),
      amount: amount,
      serviceId: serviceId,
      date: new Date(),
      status: 'pending'
    });
  }

  // Získání statistik
  getStats() {
    return {
      totalEarnings: this.earnings,
      totalServices: this.services.length,
      totalReviews: this.reviews.length,
      averageRating: this.rating,
      activeSince: this.createdAt
    };
  }
}

// Pomocná funkce pro generování ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = Worker;