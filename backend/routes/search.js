const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { User, WorkerProfile, Service } = require('../db-models');

// Search workers with filters
router.get('/workers', async (req, res) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      minRating,
      location,
      verifiedOnly,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build where clause for User
    const userWhere = {
      role: 'worker',
      status: 'active'
    };

    // Build where clause for WorkerProfile
    const workerProfileWhere = {};

    // Rating filter
    if (minRating) {
      workerProfileWhere.average_rating = {
        [Op.gte]: parseFloat(minRating)
      };
    }

    // Location filter
    if (location) {
      workerProfileWhere.location = {
        [Op.iLike]: `%${location}%`
      };
    }

    // Verified only filter
    if (verifiedOnly === 'true') {
      workerProfileWhere.is_verified = true;
    }

    // Build where clause for Service
    const serviceWhere = {
      is_active: true
    };

    // Category filter
    if (category) {
      serviceWhere.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      serviceWhere.price = {};
      if (minPrice) serviceWhere.price[Op.gte] = parseInt(minPrice);
      if (maxPrice) serviceWhere.price[Op.lte] = parseInt(maxPrice);
    }

    // Text search - search in multiple fields
    const searchConditions = [];
    if (query) {
      searchConditions.push({
        [Op.or]: [
          { email: { [Op.iLike]: `%${query}%` } },
          { '$workerProfile.stage_name$': { [Op.iLike]: `%${query}%` } },
          { '$workerProfile.bio$': { [Op.iLike]: `%${query}%` } },
          { '$services.name$': { [Op.iLike]: `%${query}%` } },
          { '$services.description$': { [Op.iLike]: `%${query}%` } }
        ]
      });
    }

    // Combine all where conditions
    const finalUserWhere = searchConditions.length > 0
      ? { [Op.and]: [userWhere, ...searchConditions] }
      : userWhere;

    // Build order clause
    let orderClause = [];
    if (sortBy === 'rating') {
      orderClause.push([{ model: WorkerProfile, as: 'workerProfile' }, 'average_rating', sortOrder.toUpperCase()]);
    } else if (sortBy === 'price') {
      orderClause.push([{ model: Service, as: 'services' }, 'price', sortOrder.toUpperCase()]);
    } else if (sortBy === 'reviews') {
      orderClause.push([{ model: WorkerProfile, as: 'workerProfile' }, 'total_reviews', sortOrder.toUpperCase()]);
    } else {
      orderClause.push([{ model: WorkerProfile, as: 'workerProfile' }, 'average_rating', 'DESC']);
    }

    // Add secondary sort by email
    orderClause.push(['email', 'ASC']);

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Execute search with Sequelize
    const { count, rows: users } = await User.findAndCountAll({
      where: finalUserWhere,
      include: [
        {
          model: WorkerProfile,
          as: 'workerProfile',
          where: workerProfileWhere,
          required: true,
          attributes: [
            'stage_name',
            'bio',
            'location',
            'hourly_rate',
            'average_rating',
            'total_reviews',
            'is_verified',
            'profile_photo_url'
          ]
        },
        {
          model: Service,
          as: 'services',
          where: serviceWhere,
          required: category || minPrice || maxPrice ? true : false,
          attributes: ['id', 'name', 'description', 'price', 'duration', 'category']
        }
      ],
      attributes: ['id', 'email', 'created_at'],
      order: orderClause,
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
      subQuery: false
    });

    // Transform results for frontend
    const transformedResults = users.map(user => ({
      id: user.id,
      email: user.email,
      stageName: user.workerProfile?.stage_name || user.email,
      bio: user.workerProfile?.bio || '',
      rating: user.workerProfile?.average_rating || 0,
      reviewsCount: user.workerProfile?.total_reviews || 0,
      servicesCount: user.services?.length || 0,
      hourlyRate: user.workerProfile?.hourly_rate || 0,
      services: user.services?.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category
      })) || [],
      location: user.workerProfile?.location || '',
      verified: user.workerProfile?.is_verified || false,
      profilePhoto: user.workerProfile?.profile_photo_url || null,
      createdAt: user.created_at
    }));

    res.json({
      success: true,
      workers: transformedResults,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        totalResults: count,
        hasNext: (parseInt(page) * parseInt(limit)) < count,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        query,
        category,
        minPrice: minPrice ? parseInt(minPrice) : null,
        maxPrice: maxPrice ? parseInt(maxPrice) : null,
        minRating: minRating ? parseFloat(minRating) : null,
        location,
        verifiedOnly: verifiedOnly === 'true'
      }
    });

  } catch (error) {
    console.error('Error searching workers:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při vyhledávání pracovníků',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get search filters and categories
router.get('/filters', async (req, res) => {
  try {
    // Get unique categories from services
    const categories = await Service.findAll({
      attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('category')), 'category']],
      where: {
        is_active: true,
        category: { [Op.ne]: null }
      },
      order: [['category', 'ASC']],
      raw: true
    });

    // Get price ranges
    const priceStats = await Service.findOne({
      attributes: [
        [require('sequelize').fn('MIN', require('sequelize').col('price')), 'minPrice'],
        [require('sequelize').fn('MAX', require('sequelize').col('price')), 'maxPrice']
      ],
      where: {
        is_active: true,
        price: { [Op.ne]: null }
      },
      raw: true
    });

    // Get unique locations from worker profiles
    const locations = await WorkerProfile.findAll({
      attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('location')), 'location']],
      where: {
        location: { [Op.ne]: null }
      },
      order: [['location', 'ASC']],
      raw: true
    });

    res.json({
      categories: categories.map(cat => cat.category).filter(Boolean),
      priceRange: {
        min: priceStats?.minPrice || 0,
        max: priceStats?.maxPrice || 10000
      },
      locations: locations.map(loc => loc.location).filter(Boolean),
      sortOptions: [
        { value: 'rating', label: 'Hodnocení' },
        { value: 'price', label: 'Cena' },
        { value: 'reviews', label: 'Počet recenzí' }
      ]
    });

  } catch (error) {
    console.error('Error getting search filters:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání filtrů',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Quick search for autocomplete
router.get('/autocomplete', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    // Search for workers
    const workers = await User.findAll({
      where: {
        role: 'worker',
        status: 'active',
        [Op.or]: [
          { email: { [Op.iLike]: `%${query}%` } },
          { '$workerProfile.stage_name$': { [Op.iLike]: `%${query}%` } }
        ]
      },
      include: [
        {
          model: WorkerProfile,
          as: 'workerProfile',
          required: true,
          attributes: ['stage_name', 'average_rating']
        }
      ],
      attributes: ['id', 'email'],
      limit: 5,
      subQuery: false
    });

    // Search for services
    const services = await Service.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { category: { [Op.iLike]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'name', 'category'],
      limit: 5
    });

    // Build suggestions
    const workerSuggestions = workers.map(user => ({
      type: 'worker',
      value: user.workerProfile?.stage_name || user.email,
      label: `👤 ${user.workerProfile?.stage_name || user.email}`,
      rating: user.workerProfile?.average_rating || 0,
      id: user.id
    }));

    const serviceSuggestions = services.map(service => ({
      type: 'service',
      value: service.name,
      label: `💼 ${service.name}`,
      category: service.category,
      id: service.id
    }));

    // Combine and remove duplicates
    const allSuggestions = [...workerSuggestions, ...serviceSuggestions];
    const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.value === suggestion.value && s.type === suggestion.type)
    );

    res.json(uniqueSuggestions.slice(0, 10));

  } catch (error) {
    console.error('Error in autocomplete:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při automatickém doplňování',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
