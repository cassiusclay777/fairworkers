const { sequelize, User, WorkerProfile, Service, Album, Wallet } = require('../db-models');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Create demo workers
    const demoWorkers = [
      {
        email: 'petra.k@fairworkers.com',
        password: 'Petra123!',
        role: 'worker',
        status: 'active',
        username: 'PetraK',
        display_name: 'Petra K.',
        bio: 'Zkušená modelka s láskou k detailu. Profesionální přístup, diskrétnost zaručena. ✨',
        email_verified: true,
        phone_verified: true,
        identity_verified: 'verified',
        avatar_url: 'https://i.pravatar.cc/300?img=5'
      },
      {
        email: 'lucie.m@fairworkers.com',
        password: 'Lucie123!',
        role: 'worker',
        status: 'active',
        username: 'LucieM',
        display_name: 'Lucie M.',
        bio: 'Mladá, energická a vždy s úsměvem. Miluji nové výzvy a dobrodružství! 💕',
        email_verified: true,
        phone_verified: true,
        identity_verified: 'verified',
        avatar_url: 'https://i.pravatar.cc/300?img=9'
      },
      {
        email: 'tereza.n@fairworkers.com',
        password: 'Tereza123!',
        role: 'worker',
        status: 'active',
        username: 'TerezaN',
        display_name: 'Tereza N.',
        bio: 'Elegantní, sofistikovaná, s perfektním vkusem. Top hodnocení od všech klientů! ⭐',
        email_verified: true,
        phone_verified: true,
        identity_verified: 'verified',
        avatar_url: 'https://i.pravatar.cc/300?img=10'
      },
      {
        email: 'karolina.s@fairworkers.com',
        password: 'Karolina123!',
        role: 'worker',
        status: 'active',
        username: 'KarolinaS',
        display_name: 'Karolína S.',
        bio: 'Fitness trenérka s dokonalým tělem. Zdravý životní styl je moje vášeň! 💪',
        email_verified: true,
        phone_verified: true,
        identity_verified: 'verified',
        avatar_url: 'https://i.pravatar.cc/300?img=20'
      },
      {
        email: 'marketa.v@fairworkers.com',
        password: 'Marketa123!',
        role: 'worker',
        status: 'active',
        username: 'MarketaV',
        display_name: 'Markéta V.',
        bio: 'Artistka s kreativní duší. Každé setkání je jedinečný umělecký zážitek! 🎨',
        email_verified: true,
        phone_verified: true,
        identity_verified: 'verified',
        avatar_url: 'https://i.pravatar.cc/300?img=25'
      }
    ];

    // Hash passwords and create users
    for (const workerData of demoWorkers) {
      const hashedPassword = await bcrypt.hash(workerData.password, 12);

      const user = await User.create({
        email: workerData.email,
        password_hash: hashedPassword,
        role: workerData.role,
        status: workerData.status,
        username: workerData.username,
        display_name: workerData.display_name,
        bio: workerData.bio,
        email_verified: workerData.email_verified,
        phone_verified: workerData.phone_verified,
        identity_verified: workerData.identity_verified,
        avatar_url: workerData.avatar_url
      });

      // Create worker profile
      await WorkerProfile.create({
        user_id: user.id,
        hourly_rate: Math.floor(Math.random() * 2000) + 1000, // 1000-3000 Kč
        location: ['Praha', 'Brno', 'Ostrava'][Math.floor(Math.random() * 3)],
        available: Math.random() > 0.3, // 70% available
        services_offered: ['Doprovod', 'Masáže', 'Tanec', 'Modeling'],
        languages: ['Čeština', 'Angličtina'],
        age: Math.floor(Math.random() * 10) + 20, // 20-30
        height: Math.floor(Math.random() * 20) + 160, // 160-180
        about_me: workerData.bio,
        verification_status: 'verified',
        total_earnings: Math.floor(Math.random() * 50000) + 10000,
        total_bookings: Math.floor(Math.random() * 50) + 10,
        average_rating: (Math.random() * 1 + 4).toFixed(1), // 4.0-5.0
        total_reviews: Math.floor(Math.random() * 40) + 10
      });

      // Create wallet
      await Wallet.create({
        user_id: user.id,
        balance: Math.floor(Math.random() * 10000),
        total_earned: Math.floor(Math.random() * 50000) + 10000,
        total_withdrawn: Math.floor(Math.random() * 30000),
        pending_withdrawal: 0
      });

      // Create some services
      const serviceTypes = [
        { name: 'Hodinový doprovod', price: 1500, duration: 60 },
        { name: 'Večerní program', price: 3000, duration: 180 },
        { name: 'Relaxační masáž', price: 1200, duration: 90 },
        { name: 'VIP večer', price: 5000, duration: 240 }
      ];

      for (let i = 0; i < Math.floor(Math.random() * 3) + 2; i++) {
        const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        await Service.create({
          worker_id: user.id,
          name: serviceType.name,
          description: `Profesionální ${serviceType.name.toLowerCase()} s individuálním přístupem.`,
          price: serviceType.price,
          duration_minutes: serviceType.duration,
          category: ['escort', 'massage', 'entertainment'][Math.floor(Math.random() * 3)],
          is_active: true
        });
      }

      // Create demo albums
      const albumNames = [
        'Profesionální Fotky',
        'Casual Style',
        'Večerní Šaty',
        'Fitness & Wellness',
        'Artistické Pózy'
      ];

      for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
        await Album.create({
          worker_id: user.id,
          title: albumNames[Math.floor(Math.random() * albumNames.length)],
          description: 'Exkluzivní kolekce profesionálních fotografií.',
          price: Math.floor(Math.random() * 500) + 200, // 200-700 Kč
          is_public: Math.random() > 0.5,
          preview_url: `https://picsum.photos/400/600?random=${Math.random()}`,
          media_count: Math.floor(Math.random() * 20) + 5
        });
      }

      console.log(`✅ Created worker: ${workerData.display_name}`);
    }

    // Create demo clients
    const demoClients = [
      {
        email: 'jan.novak@example.com',
        password: 'Client123!',
        role: 'client',
        status: 'active',
        username: 'JanN',
        display_name: 'Jan N.',
        avatar_url: 'https://i.pravatar.cc/150?img=12'
      },
      {
        email: 'petr.dvorak@example.com',
        password: 'Client123!',
        role: 'client',
        status: 'active',
        username: 'PetrD',
        display_name: 'Petr D.',
        avatar_url: 'https://i.pravatar.cc/150?img=13'
      }
    ];

    for (const clientData of demoClients) {
      const hashedPassword = await bcrypt.hash(clientData.password, 12);

      const user = await User.create({
        email: clientData.email,
        password_hash: hashedPassword,
        role: clientData.role,
        status: clientData.status,
        username: clientData.username,
        display_name: clientData.display_name,
        avatar_url: clientData.avatar_url,
        email_verified: true
      });

      // Create wallet for client
      await Wallet.create({
        user_id: user.id,
        balance: Math.floor(Math.random() * 5000) + 1000,
        total_earned: 0,
        total_withdrawn: 0,
        pending_withdrawal: 0
      });

      console.log(`✅ Created client: ${clientData.display_name}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('\n👩‍💼 Workers (role: worker):');
    console.log('   Email: petra.k@fairworkers.com | Password: Petra123!');
    console.log('   Email: lucie.m@fairworkers.com | Password: Lucie123!');
    console.log('   Email: tereza.n@fairworkers.com | Password: Tereza123!');
    console.log('   Email: karolina.s@fairworkers.com | Password: Karolina123!');
    console.log('   Email: marketa.v@fairworkers.com | Password: Marketa123!');
    console.log('\n👨‍💼 Clients (role: client):');
    console.log('   Email: jan.novak@example.com | Password: Client123!');
    console.log('   Email: petr.dvorak@example.com | Password: Client123!');
    console.log('\n💡 Tip: Přihlaš se jako worker a uvidíš dashboard s reálnými daty!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seeding complete! Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
