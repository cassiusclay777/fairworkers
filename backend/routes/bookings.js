const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Booking, User } = require('../db-models');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all bookings for a user (worker or client)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query; // 'worker' or 'client'

    let whereClause = {};
    if (role === 'worker') {
      whereClause.worker_id = userId;
    } else if (role === 'client') {
      whereClause.client_id = userId;
    } else {
      // Return all bookings where user is either worker or client
      whereClause = {
        [Op.or]: [
          { worker_id: userId },
          { client_id: userId }
        ]
      };
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'username', 'email', 'display_name']
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'email', 'display_name']
        }
      ],
      order: [['start_time', 'DESC']]
    });

    res.json({
      success: true,
      bookings,
      total: bookings.length
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání rezervací'
    });
  }
});

// Create new booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      clientId,
      workerId,
      serviceId,
      startTime,
      duration, // in minutes
      location,
      specialRequests,
      servicePrice
    } = req.body;

    // Validate required fields
    if (!clientId || !workerId || !serviceId || !startTime || !duration || !location || !servicePrice) {
      return res.status(400).json({
        success: false,
        error: 'Všechna povinná pole musí být vyplněna'
      });
    }

    // Calculate end time and earnings
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    const price = parseFloat(servicePrice);
    const commission = price * 0.15; // 15% commission
    const earnings = price - commission;

    const booking = await Booking.create({
      worker_id: workerId,
      client_id: clientId,
      service_id: serviceId,
      start_time: start,
      end_time: end,
      duration_minutes: duration,
      location,
      status: 'pending',
      service_price: price,
      platform_commission: commission,
      worker_earnings: earnings,
      client_notes: specialRequests || null
    });

    // Fetch with associations
    const createdBooking = await Booking.findByPk(booking.id, {
      include: [
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'username', 'email', 'display_name']
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'email', 'display_name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Rezervace úspěšně vytvořena',
      booking: createdBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při vytváření rezervace'
    });
  }
});

// Update booking status
router.patch('/:bookingId/status', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, notes, role } = req.body;
    const userId = req.user.id;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Neplatný stav rezervace'
      });
    }

    // Find booking first
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Rezervace nenalezena'
      });
    }

    // IDOR Protection: Verify user has permission
    if (booking.worker_id !== userId && booking.client_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Nemáte oprávnění upravit tuto rezervaci'
      });
    }

    const updateData = { status };

    // Handle cancellation
    if (status === 'cancelled') {
      updateData.cancelled_by = userId;
      updateData.cancelled_at = new Date();
      if (notes) {
        updateData.cancellation_reason = notes;
      }
    }

    // Add notes based on role
    if (notes && status !== 'cancelled') {
      if (role === 'worker' || booking.worker_id === userId) {
        updateData.worker_notes = notes;
      } else {
        updateData.client_notes = notes;
      }
    }

    await booking.update(updateData);

    // Fetch updated booking with associations
    const updatedBooking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'username', 'email', 'display_name']
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'email', 'display_name']
        }
      ]
    });

    res.json({
      success: true,
      message: `Rezervace ${getStatusText(status)}`,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při aktualizaci rezervace'
    });
  }
});

// Get booking by ID
router.get('/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'username', 'email', 'display_name']
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'email', 'display_name']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Rezervace nenalezena'
      });
    }

    // IDOR Protection
    if (booking.worker_id !== userId && booking.client_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Nemáte oprávnění zobrazit tuto rezervaci'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání rezervace'
    });
  }
});

// Get booking statistics
router.get('/stats/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    // IDOR Protection: users can only see their own stats (type-safe comparison)
    const userIdStr = String(userId);
    const reqUserIdStr = String(req.user.id);

    if (reqUserIdStr !== userIdStr && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Nemáte oprávnění zobrazit tyto statistiky'
      });
    }

    let whereClause = {};
    if (role === 'worker') {
      whereClause.worker_id = userId;
    } else if (role === 'client') {
      whereClause.client_id = userId;
    } else {
      whereClause = {
        [Op.or]: [
          { worker_id: userId },
          { client_id: userId }
        ]
      };
    }

    // Count by status
    const allBookings = await Booking.findAll({
      where: whereClause,
      attributes: ['status', 'service_price']
    });

    const stats = {
      totalBookings: allBookings.length,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      completionRate: 0
    };

    allBookings.forEach(booking => {
      switch (booking.status) {
        case 'pending':
          stats.pendingBookings++;
          break;
        case 'confirmed':
          stats.confirmedBookings++;
          break;
        case 'completed':
          stats.completedBookings++;
          stats.totalRevenue += parseFloat(booking.service_price || 0);
          break;
        case 'cancelled':
          stats.cancelledBookings++;
          break;
      }
    });

    if (stats.totalBookings > 0) {
      stats.completionRate = ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1);
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání statistik'
    });
  }
});

// Get bookings for specific worker
router.get('/worker/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;

    const bookings = await Booking.findAll({
      where: { worker_id: workerId },
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'display_name']
        }
      ],
      order: [['start_time', 'ASC']]
    });

    // Format for frontend
    const formattedBookings = bookings.map(b => ({
      id: b.id,
      clientName: b.client?.display_name || b.client?.username || 'Unknown',
      service: {
        id: b.service_id,
        name: b.service_id,
        icon: '📞'
      },
      date: b.start_time.toISOString().split('T')[0],
      time: b.start_time.toTimeString().substring(0, 5),
      status: b.status,
      price: b.service_price
    }));

    res.json({
      success: true,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error('Error fetching worker bookings:', error);
    res.json({ success: false, bookings: [] });
  }
});

// Get availability for worker
router.get('/availability/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;

    // Mock availability for now - in production, store this in database
    const availability = {
      '2025-11-15': ['10:00', '11:00', '14:00', '15:00', '16:00', '18:00', '19:00', '20:00'],
      '2025-11-16': ['12:00', '13:00', '14:00', '15:00', '18:00', '19:00', '20:00', '21:00'],
      '2025-11-17': ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00']
    };

    res.json({
      success: true,
      availability
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.json({ success: false, availability: {} });
  }
});

// Set availability for worker
router.post('/set-availability', authenticateToken, async (req, res) => {
  try {
    const { workerId, date, times } = req.body;

    // In production, save to database
    console.log(`Setting availability for worker ${workerId} on ${date}:`, times);

    res.json({
      success: true,
      message: 'Dostupnost nastavena'
    });
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ success: false, error: 'Chyba při nastavení dostupnosti' });
  }
});

// Create booking (simplified endpoint)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { workerId, clientId, serviceId, date, time, price, duration } = req.body;

    // Combine date and time
    const startTime = new Date(`${date}T${time}:00`);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const commission = price * 0.15;
    const earnings = price - commission;

    const booking = await Booking.create({
      worker_id: workerId,
      client_id: clientId,
      service_id: serviceId,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: duration,
      location: 'online',
      status: 'confirmed',
      service_price: price,
      platform_commission: commission,
      worker_earnings: earnings
    });

    res.status(201).json({
      success: true,
      message: 'Rezervace vytvořena',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Chyba při vytváření rezervace' });
  }
});

// Cancel booking
router.post('/:bookingId/cancel', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Rezervace nenalezena' });
    }

    // IDOR Protection
    if (booking.worker_id !== userId && booking.client_id !== userId) {
      return res.status(403).json({ success: false, error: 'Nemáte oprávnění' });
    }

    await booking.update({
      status: 'cancelled',
      cancelled_by: userId,
      cancelled_at: new Date()
    });

    res.json({
      success: true,
      message: 'Rezervace zrušena'
    });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ success: false, error: 'Chyba při rušení rezervace' });
  }
});

// Helper function for status text
function getStatusText(status) {
  const statusMap = {
    pending: 'čeká na potvrzení',
    confirmed: 'potvrzena',
    completed: 'dokončena',
    cancelled: 'zrušena'
  };
  return statusMap[status] || status;
}

module.exports = router;
