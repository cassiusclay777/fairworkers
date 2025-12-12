const axios = require('axios');

/**
 * Age Verification Middleware
 * Ensures users are 18+ before accessing adult content
 * Complies with 2257 regulations
 */

// Check if user has valid age verification
const ageVerificationRequired = async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Skip if already verified within last year
  if (user.ageVerified && user.ageVerifiedAt) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (new Date(user.ageVerifiedAt) > oneYearAgo) {
      return next();
    }
  }

  // If Yoti integration is available, redirect to verification
  if (process.env.YOTI_CLIENT_SDK_ID) {
    return res.status(403).json({
      error: 'Age verification required',
      requiresVerification: true,
      yotiSDKId: process.env.YOTI_CLIENT_SDK_ID,
      redirectUrl: `${process.env.API_URL}/verify/age?token=${user.id}`,
      message: 'You must verify your age (18+) to access this content'
    });
  }

  // Fallback: Check if user provided birth date
  if (user.birthDate) {
    const birthDate = new Date(user.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 18) {
      return next();
    }
  }

  return res.status(403).json({
    error: 'Age verification required',
    message: 'You must be 18 years or older to access this content',
    requiresVerification: true
  });
};

/**
 * Verify age with Yoti (optional integration)
 * This would be called from a dedicated route after Yoti callback
 */
const verifyAgeWithYoti = async (userId, yotiToken) => {
  try {
    if (!process.env.YOTI_CLIENT_SDK_ID || !process.env.YOTI_PEM_FILE_PATH) {
      throw new Error('Yoti not configured');
    }

    // Yoti SDK would be integrated here
    // This is a placeholder for the actual Yoti verification logic
    const response = await axios.post(
      'https://api.yoti.com/api/v1/profile',
      {
        token: yotiToken
      },
      {
        headers: {
          'X-Yoti-Auth-Key': process.env.YOTI_CLIENT_SDK_ID
        }
      }
    );

    // Extract age from Yoti response
    const ageVerified = response.data.age_verified;
    const dateOfBirth = response.data.date_of_birth;

    return {
      verified: ageVerified,
      dateOfBirth: dateOfBirth,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Yoti verification error:', error);
    return null;
  }
};

/**
 * Middleware to check if content is age-restricted
 */
const checkContentAgeRestriction = (req, res, next) => {
  // For adult content platform, all content is age-restricted by default
  return ageVerificationRequired(req, res, next);
};

/**
 * Store age verification result in database
 */
const storeAgeVerification = async (userId, verificationData) => {
  try {
    const { User } = require('../db-models');

    await User.update(
      {
        ageVerified: true,
        ageVerifiedAt: new Date(),
        birthDate: verificationData.dateOfBirth || null
      },
      {
        where: { id: userId }
      }
    );

    return true;
  } catch (error) {
    console.error('Error storing age verification:', error);
    return false;
  }
};

module.exports = {
  ageVerificationRequired,
  verifyAgeWithYoti,
  checkContentAgeRestriction,
  storeAgeVerification
};
