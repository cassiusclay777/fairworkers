class SecuritySystem {
  constructor() {
    this.emergencyContacts = ['112', '158']; // Policie, záchranka
    this.safetyCheckInterval = 30; // minut mezi kontrolami
    this.emergencyProtocols = {
      immediate: 'Kontaktovat podporu a policii',
      standard: 'Kontrola bezpečnosti po schůzce'
    };
  }

  // Tísňové tlačítko - okamžité upozornění
  async triggerEmergencyAlert(workerId, location, details = {}) {
    const alert = {
      workerId,
      timestamp: new Date(),
      location,
      details,
      status: 'active',
      contactsNotified: this.emergencyContacts
    };

    // Simulace odeslání upozornění
    console.log(`🚨 TÍSŇOVÝ SIGNÁL od pracovníka ${workerId}`);
    console.log(`📍 Lokalita: ${location}`);
    console.log(`📞 Kontakty: ${this.emergencyContacts.join(', ')}`);
    
    return {
      success: true,
      alertId: `alert_${Date.now()}`,
      message: 'Pomoc je na cestě',
      timestamp: alert.timestamp
    };
  }

  // Plánování bezpečnostní kontroly
  scheduleSafetyCheck(workerId, appointmentTime, duration = 60) {
    const checkTime = new Date(appointmentTime);
    checkTime.setMinutes(checkTime.getMinutes() + duration);
    
    return {
      workerId,
      scheduledCheck: checkTime,
      checkType: 'post_appointment',
      message: `Bezpečnostní kontrola naplánována na ${checkTime.toLocaleString()}`
    };
  }

  // Kontrola po schůzce
  async performSafetyCheck(workerId) {
    const questions = [
      'Jste v bezpečí?',
      'Potřebujete nějakou pomoc?',
      'Chcete nahlásit nějaký problém?'
    ];

    return {
      workerId,
      checkTime: new Date(),
      questions,
      status: 'pending_response'
    };
  }

  // Anonymní nahlášení problému
  submitAnonymousReport(issueType, description, location = null) {
    const report = {
      reportId: `report_${Date.now()}`,
      issueType, // 'safety_concern', 'client_behavior', 'platform_issue'
      description,
      location,
      timestamp: new Date(),
      anonymous: true
    };

    return {
      success: true,
      reportId: report.reportId,
      message: 'Hlášení bylo odesláno anonymně'
    };
  }

  // Bezpečnostní tipy a zdroje
  getSafetyResources() {
    return {
      emergencyContacts: this.emergencyContacts,
      safetyTips: [
        'Vždy informujte důvěryhodnou osobu o své poloze',
        'Stanovte si bezpečnostní slovo',
        'První schůzku na veřejném místě',
        'Důvěřujte svým instinktům'
      ],
      supportOrganizations: [
        'ROSA - centrum pro oběti domácího násilí',
        'ProFem - poradna pro oběti trestných činů'
      ]
    };
  }
}

module.exports = SecuritySystem;