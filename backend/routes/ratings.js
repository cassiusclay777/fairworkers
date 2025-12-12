const express = require('express');
const router = express.Router();
const { Rating, User, Purchase, Booking } = require('../db-models');
const { authenticateToken } = require('../middleware/auth');

// GET /api/ratings/worker/:workerId - Získat hodnocení workera
router.get('/worker/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.findAndCountAll({
      where: { 
        worker_id: workerId,
        status: 'approved'
      },
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        },
        {
          model: Purchase,
          as: 'purchase',
          attributes: ['id', 'created_at']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'service_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Výpočet průměrného hodnocení
    const averageRating = await Rating.findOne({
      where: { 
        worker_id: workerId,
        status: 'approved'
      },
      attributes: [
        [Rating.sequelize.fn('AVG', Rating.sequelize.col('rating')), 'average'],
        [Rating.sequelize.fn('COUNT', Rating.sequelize.col('id')), 'count']
      ],
      raw: true
    });

    res.json({
      success: true,
      ratings: ratings.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: ratings.count,
        pages: Math.ceil(ratings.count / parseInt(limit))
      },
      statistics: {
        average: parseFloat(averageRating?.average || 0).toFixed(1),
        total: parseInt(averageRating?.count || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při načítání hodnocení.',
      error: error.message
    });
  }
});

// POST /api/ratings - Vytvořit nové hodnocení
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { worker_id, rating, review, purchase_id, booking_id } = req.body;
    const client_id = req.user.id;

    // Validace
    if (!worker_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID a hodnocení jsou povinné.'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Hodnocení musí být mezi 1 a 5 hvězdičkami.'
      });
    }

    // Kontrola, zda worker existuje
    const worker = await User.findByPk(worker_id);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({
        success: false,
        message: 'Worker nebyl nalezen.'
      });
    }

    // Kontrola, zda klient již hodnotil tohoto workera pro daný nákup/rezervaci
    const existingRating = await Rating.findOne({
      where: {
        worker_id,
        client_id,
        ...(purchase_id && { purchase_id }),
        ...(booking_id && { booking_id })
      }
    });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: 'Tohoto workera jste již hodnotil.'
      });
    }

    // Kontrola, zda klient skutečně provedl nákup/rezervaci
    if (purchase_id) {
      const purchase = await Purchase.findOne({
        where: {
          id: purchase_id,
          buyer_id: client_id,
          seller_id: worker_id
        }
      });

      if (!purchase) {
        return res.status(403).json({
          success: false,
          message: 'Nemůžete hodnotit albu, které jste si nekoupil.'
        });
      }
    }

    if (booking_id) {
      const booking = await Booking.findOne({
        where: {
          id: booking_id,
          client_id: client_id,
          worker_id: worker_id
        }
      });

      if (!booking) {
        return res.status(403).json({
          success: false,
          message: 'Nemůžete hodnotit rezervaci, kterou jste neprovedl.'
        });
      }
    }

    // Vytvoření hodnocení
    const newRating = await Rating.create({
      worker_id,
      client_id,
      rating,
      review: review || null,
      purchase_id: purchase_id || null,
      booking_id: booking_id || null,
      is_verified: !!(purchase_id || booking_id),
      status: 'approved' // Auto-schválení pro ověřené recenze
    });

    // Načtení kompletních dat
    const ratingWithDetails = await Rating.findByPk(newRating.id, {
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Hodnocení bylo úspěšně přidáno.',
      rating: ratingWithDetails
    });
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při vytváření hodnocení.',
      error: error.message
    });
  }
});

// PUT /api/ratings/:ratingId - Upravit hodnocení
router.put('/:ratingId', authenticateToken, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review } = req.body;
    const client_id = req.user.id;

    const existingRating = await Rating.findOne({
      where: {
        id: ratingId,
        client_id
      }
    });

    if (!existingRating) {
      return res.status(404).json({
        success: false,
        message: 'Hodnocení nebylo nalezeno.'
      });
    }

    // Aktualizace
    await existingRating.update({
      rating: rating || existingRating.rating,
      review: review !== undefined ? review : existingRating.review,
      status: 'pending' // Znovu schválit po změně
    });

    res.json({
      success: true,
      message: 'Hodnocení bylo úspěšně upraveno.',
      rating: existingRating
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při úpravě hodnocení.',
      error: error.message
    });
  }
});

// DELETE /api/ratings/:ratingId - Smazat hodnocení
router.delete('/:ratingId', authenticateToken, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const client_id = req.user.id;

    const rating = await Rating.findOne({
      where: {
        id: ratingId,
        client_id
      }
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Hodnocení nebylo nalezeno.'
      });
    }

    await rating.destroy();

    res.json({
      success: true,
      message: 'Hodnocení bylo úspěšně smazáno.'
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při mazání hodnocení.',
      error: error.message
    });
  }
});

// GET /api/ratings/my-ratings - Získat hodnocení daná uživatelem
router.get('/my-ratings', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const user_id = req.user.id;

    const ratings = await Rating.findAndCountAll({
      where: { client_id: user_id },
      include: [
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'username', 'display_name', 'avatar_url']
        },
        {
          model: Purchase,
          as: 'purchase',
          attributes: ['id', 'album_id']
        },
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'service_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      success: true,
      ratings: ratings.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: ratings.count,
        pages: Math.ceil(ratings.count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při načítání hodnocení.',
      error: error.message
    });
  }
});

module.exports = router;