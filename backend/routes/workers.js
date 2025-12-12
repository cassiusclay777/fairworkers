const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { query, body } = require('express-validator');
const { User, WorkerProfile, Service } = require('../db-models');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors, sanitizeString } = require('../middleware/validator');

// POST /api/workers/onboarding - Complete onboarding (authenticated users)
router.post('/onboarding',
  authenticateToken,
  [
    body('displayName').optional().trim().isLength({ min: 2, max: 150 }),
    body('bio').optional().trim().isLength({ max: 1000 }),
    body('profileType').optional().isIn(['worker', 'client']),
    body('categories').optional().isArray(),
    body('priceRange').optional().isString(),
    body('availability').optional().isString(),
    body('paymentMethod').optional().isString(),
    body('notifications').optional().isBoolean(),
    body('privacyLevel').optional().isString(),
    handleValidationErrors
  ],
  async (req, res) => {
    try {
      const {
        displayName,
        bio,
        profileType,
        categories,
        priceRange,
        availability,
        paymentMethod,
        notifications,
        privacyLevel
      } = req.body;

      // Update User table fields
      const userUpdates = {};
      if (displayName) userUpdates.display_name = sanitizeString(displayName);
      if (bio) userUpdates.bio = sanitizeString(bio);
      if (profileType && profileType !== req.user.role) {
        userUpdates.role = profileType;
      }

      if (Object.keys(userUpdates).length > 0) {
        await User.update(userUpdates, {
          where: { id: req.user.id }
        });
      }

      // If worker, create or update WorkerProfile
      const finalRole = profileType || req.user.role;
      if (finalRole === 'worker') {
        let workerProfile = await WorkerProfile.findOne({
          where: { user_id: req.user.id }
        });

        // Parse price range to get hourly_rate
        let hourlyRate = null;
        if (priceRange) {
          const match = priceRange.match(/(\d+)-(\d+)/);
          if (match) {
            const minPrice = parseInt(match[1]);
            const maxPrice = parseInt(match[2]);
            hourlyRate = (minPrice + maxPrice) / 2; // Use average
          }
        }

        const workerData = {
          is_available: availability === 'flexible' || availability === 'available'
        };
        if (hourlyRate) workerData.hourly_rate = hourlyRate;

        if (workerProfile) {
          await workerProfile.update(workerData);
        } else {
          await WorkerProfile.create({
            user_id: req.user.id,
            ...workerData
          });
        }
      }

      // Get updated user with profile
      const updatedUser = await User.findByPk(req.user.id, {
        include: [
          { model: WorkerProfile, as: 'workerProfile' }
        ]
      });

      res.json({
        success: true,
        message: 'Profil úspěšně nastaven',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          display_name: updatedUser.display_name,
          bio: updatedUser.bio,
          role: updatedUser.role,
          workerProfile: updatedUser.workerProfile
        }
      });
    } catch (error) {
      console.error('Onboarding error:', error);
      res.status(500).json({
        success: false,
        message: 'Chyba při ukládání profilu',
        error: error.message
      });
    }
});

// GET /api/workers - Get all workers (public)
router.get('/',
  optionalAuth,
  [
    query('location').optional().trim().isLength({ max: 100 }).withMessage('Lokalita může mít max 100 znaků'),
    query('min_rate').optional().isInt({ min: 0 }).withMessage('Minimální sazba musí být kladné číslo'),
    query('max_rate').optional().isInt({ min: 0 }).withMessage('Maximální sazba musí být kladné číslo'),
    query('available_only').optional().isBoolean().withMessage('available_only musí být boolean'),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const { location, min_rate, max_rate, available_only } = req.query;

    // Build query conditions
    const whereClause = {};
    if (available_only === 'true') {
      whereClause.is_available = true;
    }
    if (min_rate) {
      whereClause.hourly_rate = { ...whereClause.hourly_rate, [Op.gte]: parseInt(min_rate) };
    }
    if (max_rate) {
      whereClause.hourly_rate = { ...whereClause.hourly_rate, [Op.lte]: parseInt(max_rate) };
    }
    if (location) {
      // Sanitize location to prevent SQL injection
      const sanitizedLocation = sanitizeString(location);
      whereClause.location = { [Op.iLike]: `%${sanitizedLocation}%` };
    }

    const workers = await User.findAll({
      where: { role: 'worker', status: 'active' },
      include: [{
        model: WorkerProfile,
        as: 'workerProfile',
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        required: true
      }],
      attributes: ['id', 'username', 'display_name', 'avatar_url', 'bio', 'created_at'],
      order: [[{ model: WorkerProfile, as: 'workerProfile' }, 'average_rating', 'DESC']]
    });

    const workerList = workers.map(worker => ({
      id: worker.id,
      username: worker.username,
      display_name: worker.display_name,
      displayName: worker.display_name || worker.username,
      avatar_url: worker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.username)}&size=200`,
      avatar: worker.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.username)}&size=200`,
      stage_name: worker.workerProfile.stage_name,
      location: worker.workerProfile.location,
      hourly_rate: worker.workerProfile.hourly_rate,
      rating: parseFloat(worker.workerProfile.average_rating || 0),
      total_bookings: worker.workerProfile.total_bookings,
      totalBookings: worker.workerProfile.total_bookings,
      totalEarnings: worker.workerProfile.total_earnings || 0,
      servicesCount: worker.workerProfile.total_bookings || 0,
      reviewsCount: worker.workerProfile.total_reviews || 0,
      is_available: worker.workerProfile.is_available,
      available: worker.workerProfile.is_available,
      response_time_minutes: worker.workerProfile.response_time_minutes,
      verified: true,
      bio: worker.bio || ''
    }));

    res.json({
      success: true,
      workers: workerList,
      total: workerList.length
    });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při načítání pracovníků',
      error: error.message
    });
  }
});

// GET /api/workers/:id - Get worker detail (public)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const worker = await User.findOne({
      where: { id: req.params.id, role: 'worker' },
      include: [
        {
          model: WorkerProfile,
          as: 'workerProfile'
        },
        {
          model: Service,
          as: 'services',
          where: { is_active: true },
          required: false
        }
      ],
      attributes: { exclude: ['password_hash'] }
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Pracovník nenalezen'
      });
    }

    res.json({
      success: true,
      worker: {
        id: worker.id,
        username: worker.username,
        display_name: worker.display_name,
        avatar_url: worker.avatar_url,
        bio: worker.bio,
        profile: worker.workerProfile,
        services: worker.services
      }
    });
  } catch (error) {
    console.error('Get worker detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při načítání pracovníka',
      error: error.message
    });
  }
});

// PUT /api/workers/profile - Update worker profile (worker only)
router.put('/profile',
  authenticateToken,
  requireRole('worker'),
  [
    query('stage_name').optional().trim().isLength({ max: 100 }),
    query('age').optional().isInt({ min: 18, max: 120 }),
    query('location').optional().trim().isLength({ max: 255 }),
    query('hourly_rate').optional().isInt({ min: 0 }),
    query('minimum_booking_hours').optional().isInt({ min: 1 }),
    handleValidationErrors
  ],
  async (req, res) => {
  try {
    const {
      stage_name,
      age,
      location,
      languages,
      hourly_rate,
      minimum_booking_hours,
      is_available,
      accepts_new_clients
    } = req.body;

    // Sanitize text inputs
    const sanitizedData = {
      stage_name: stage_name ? sanitizeString(stage_name) : undefined,
      age,
      location: location ? sanitizeString(location) : undefined,
      languages,
      hourly_rate,
      minimum_booking_hours,
      is_available,
      accepts_new_clients
    };

    const workerProfile = await WorkerProfile.findOne({
      where: { user_id: req.user.id }
    });

    if (!workerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profil nenalezen'
      });
    }

    // Remove undefined values
    Object.keys(sanitizedData).forEach(key =>
      sanitizedData[key] === undefined && delete sanitizedData[key]
    );

    await workerProfile.update(sanitizedData);

    res.json({
      success: true,
      message: 'Profil úspěšně aktualizován',
      profile: workerProfile
    });
  } catch (error) {
    console.error('Update worker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při aktualizaci profilu',
      error: error.message
    });
  }
});

// POST /api/workers/services - Add service (worker only)
router.post('/services', authenticateToken, requireRole('worker'), async (req, res) => {
  try {
    const { name, description, duration_minutes, price, requires_deposit, deposit_amount } = req.body;

    if (!name || !duration_minutes || !price) {
      return res.status(400).json({
        success: false,
        message: 'Název, délka a cena jsou povinné'
      });
    }

    const service = await Service.create({
      worker_id: req.user.id,
      name,
      description,
      duration_minutes,
      price,
      requires_deposit,
      deposit_amount,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Služba úspěšně přidána',
      service
    });
  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při přidávání služby',
      error: error.message
    });
  }
});

// PUT /api/workers/services/:serviceId - Update service (worker only)
router.put('/services/:serviceId', authenticateToken, requireRole('worker'), async (req, res) => {
  try {
    const service = await Service.findOne({
      where: { id: req.params.serviceId, worker_id: req.user.id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Služba nenalezena'
      });
    }

    await service.update(req.body);

    res.json({
      success: true,
      message: 'Služba aktualizována',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při aktualizaci služby',
      error: error.message
    });
  }
});

// DELETE /api/workers/services/:serviceId - Delete service (worker only)
router.delete('/services/:serviceId', authenticateToken, requireRole('worker'), async (req, res) => {
  try {
    const service = await Service.findOne({
      where: { id: req.params.serviceId, worker_id: req.user.id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Služba nenalezena'
      });
    }

    await service.update({ is_active: false });

    res.json({
      success: true,
      message: 'Služba deaktivována'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při mazání služby',
      error: error.message
    });
  }
});

// GET /api/workers/my/services - Get my services (worker only)
router.get('/my/services', authenticateToken, requireRole('worker'), async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { worker_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při načítání služeb',
      error: error.message
    });
  }
});

module.exports = router;
