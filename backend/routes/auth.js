const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { sequelize, User, WorkerProfile, ClientProfile } = require('../db-models');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// POST /api/auth/register - Register new user
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, password, role, username, display_name, phone } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email a heslo jsou povinné.'
      });
    }

    // Strong password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Heslo musí mít alespoň 8 znaků.'
      });
    }

    // Check password complexity - simplified: at least one special character
    const passwordRegex = /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Heslo musí obsahovat alespoň jeden speciální znak (@$!%*?&).'
      });
    }

    if (role && !['worker', 'client'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Neplatná role. Povolené: worker, client'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Uživatel s tímto emailem již existuje.'
      });
    }

    // Hash password
    const password_hash = await User.hashPassword(password);

    // Use transaction to ensure atomicity
    const t = await sequelize.transaction();

    try {
      // Create user
      const user = await User.create({
        email,
        password_hash,
        role: role || 'client',
        username,
        display_name,
        phone,
        status: 'active' // Auto-activate for now (later add email verification)
      }, { transaction: t });

      // Create profile based on role
      if (user.role === 'worker') {
        await WorkerProfile.create({
          user_id: user.id
        }, { transaction: t });
      } else if (user.role === 'client') {
        await ClientProfile.create({
          user_id: user.id
        }, { transaction: t });
      }

      // Commit transaction
      await t.commit();

      // Generate tokens
      const token = generateToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      res.status(201).json({
        success: true,
        message: 'Registrace úspěšná!',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          username: user.username,
          display_name: user.display_name
        },
        token,
        refreshToken
      });
    } catch (transactionError) {
      // Rollback transaction on error
      await t.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při registraci.',
      error: error.message
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email a heslo jsou povinné.'
      });
    }

    // Find user
    const user = await User.findOne({
      where: { email },
      include: [
        { model: WorkerProfile, as: 'workerProfile' },
        { model: ClientProfile, as: 'clientProfile' }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Neplatné přihlašovací údaje.'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Neplatné přihlašovací údaje.'
      });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Účet je pozastaven nebo zakázán.'
      });
    }

    // Update last login
    await user.update({ last_login_at: new Date() });

    // Generate tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Přihlášení úspěšné!',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        profile: user.role === 'worker' ? user.workerProfile : user.clientProfile
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při přihlášení.',
      error: error.message
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: WorkerProfile, as: 'workerProfile' },
        { model: ClientProfile, as: 'clientProfile' }
      ],
      attributes: { exclude: ['password_hash'] }
    });

    res.json({
      success: true,
      user: {
        ...user.toJSON(),
        profile: user.role === 'worker' ? user.workerProfile : user.clientProfile
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při načítání uživatele.',
      error: error.message
    });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token je povinný.'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Neplatný refresh token.'
      });
    }

    const newToken = generateToken(user.id, user.role);

    res.json({
      success: true,
      token: newToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Neplatný nebo expirovaný refresh token.'
    });
  }
});

// POST /api/auth/logout - Logout (client-side mainly)
router.post('/logout', authenticateToken, (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Odhlášení úspěšné.'
  });
});

module.exports = router;
