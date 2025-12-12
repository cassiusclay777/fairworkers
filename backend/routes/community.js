const express = require('express');
const CommunitySystem = require('../models/CommunitySystem');

const router = express.Router();
const communitySystem = new CommunitySystem();

// Vytvoření anonymního příspěvku
router.post('/posts/anonymous', (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({
        error: 'Chybí povinná data: title, content, category'
      });
    }

    const result = communitySystem.createAnonymousPost(title, content, category, tags);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Chyba při vytváření příspěvku:', error);
    res.status(500).json({
      error: 'Nepodařilo se vytvořit příspěvek'
    });
  }
});

// Přidání komentáře
router.post('/posts/:postId/comments', (req, res) => {
  try {
    const { postId } = req.params;
    const { content, anonymous = true } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: 'Chybí obsah komentáře'
      });
    }

    const result = communitySystem.addComment(postId, content, anonymous);
    res.json(result);
  } catch (error) {
    console.error('Chyba při přidávání komentáře:', error);
    res.status(500).json({
      error: 'Nepodařilo se přidat komentář'
    });
  }
});

// Hodnocení příspěvku
router.post('/posts/:postId/rate', (req, res) => {
  try {
    const { postId } = req.params;
    const { rating } = req.body;
    
    if (!rating) {
      return res.status(400).json({
        error: 'Chybí hodnocení (rating)'
      });
    }

    const result = communitySystem.ratePost(postId, rating);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Chyba při hodnocení příspěvku:', error);
    res.status(500).json({
      error: 'Nepodařilo se ohodnotit příspěvek'
    });
  }
});

// Získání oblíbených příspěvků
router.get('/posts/popular', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = communitySystem.getPopularPosts(parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Chyba při načítání příspěvků:', error);
    res.status(500).json({
      error: 'Nepodařilo se načíst příspěvky'
    });
  }
});

// Vyhledávání v komunitě
router.get('/search', (req, res) => {
  try {
    const { q: query, category } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Chybí vyhledávací dotaz (q)'
      });
    }

    const result = communitySystem.searchCommunity(query, category);
    res.json(result);
  } catch (error) {
    console.error('Chyba při vyhledávání:', error);
    res.status(500).json({
      error: 'Nepodařilo se provést vyhledávání'
    });
  }
});

// Zdroje komunity
router.get('/resources', (req, res) => {
  try {
    const result = communitySystem.getCommunityResources();
    res.json(result);
  } catch (error) {
    console.error('Chyba při načítání zdrojů:', error);
    res.status(500).json({
      error: 'Nepodařilo se načíst zdroje'
    });
  }
});

// Statistiky komunity
router.get('/stats', (req, res) => {
  try {
    const result = communitySystem.getCommunityStats();
    res.json(result);
  } catch (error) {
    console.error('Chyba při načítání statistik:', error);
    res.status(500).json({
      error: 'Nepodařilo se načíst statistiky'
    });
  }
});

// Stav komunitního systému
router.get('/status', (req, res) => {
  res.json({
    success: true,
    system: 'FairWorkers Community System',
    status: 'active',
    categories: communitySystem.supportCategories,
    features: [
      'Anonymní příspěvky',
      'Komunitní podpora',
      'Bezpečnostní zdroje',
      'Hodnocení příspěvků'
    ],
    lastUpdated: new Date().toISOString()
  });
});

// ========== FOLLOWER & SUBSCRIPTION SYSTEM ==========

// Import database models for persistent storage
const { Follow, Subscribe } = require('../db-models');

// Follow a worker
router.post('/follow/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const followerId = req.body.followerId || '1'; // Mock user ID

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: workerId
      }
    });

    if (existingFollow) {
      return res.json({
        success: true,
        message: 'Už sleduješ tohoto workera',
        followerCount: await Follow.count({ where: { following_id: workerId } })
      });
    }

    // Create new follow relationship
    await Follow.create({
      follower_id: followerId,
      following_id: workerId
    });

    const followerCount = await Follow.count({ where: { following_id: workerId } });

    res.json({
      success: true,
      message: 'Nyní sleduješ tohoto workera',
      followerCount
    });
  } catch (error) {
    console.error('Error following:', error);
    res.status(500).json({ success: false, error: 'Něco se pokazilo' });
  }
});

// Unfollow a worker
router.post('/unfollow/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const followerId = req.body.followerId || '1';

    // Delete follow relationship
    await Follow.destroy({
      where: {
        follower_id: followerId,
        following_id: workerId
      }
    });

    const followerCount = await Follow.count({ where: { following_id: workerId } });

    res.json({
      success: true,
      message: 'Už nesleduješ tohoto workera',
      followerCount
    });
  } catch (error) {
    console.error('Error unfollowing:', error);
    res.status(500).json({ success: false, error: 'Něco se pokazilo' });
  }
});

// Subscribe to a worker (VIP)
router.post('/subscribe/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const subscriberId = req.body.subscriberId || '1';

    // Check if already subscribed
    const existingSubscription = await Subscribe.findOne({
      where: {
        subscriber_id: subscriberId,
        subscribed_to_id: workerId
      }
    });

    if (existingSubscription) {
      return res.json({
        success: true,
        message: 'Už máš aktivní VIP Subscription! 💎',
        subscriberCount: await Subscribe.count({ where: { subscribed_to_id: workerId } })
      });
    }

    // Create subscription
    await Subscribe.create({
      subscriber_id: subscriberId,
      subscribed_to_id: workerId
    });

    // Also auto-follow if not already following
    const existingFollow = await Follow.findOne({
      where: {
        follower_id: subscriberId,
        following_id: workerId
      }
    });

    if (!existingFollow) {
      await Follow.create({
        follower_id: subscriberId,
        following_id: workerId
      });
    }

    const subscriberCount = await Subscribe.count({ where: { subscribed_to_id: workerId } });

    res.json({
      success: true,
      message: 'VIP Subscription aktivován! 💎',
      subscriberCount
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ success: false, error: 'Něco se pokazilo' });
  }
});

// Unsubscribe from a worker
router.post('/unsubscribe/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const subscriberId = req.body.subscriberId || '1';

    // Delete subscription
    await Subscribe.destroy({
      where: {
        subscriber_id: subscriberId,
        subscribed_to_id: workerId
      }
    });

    const subscriberCount = await Subscribe.count({ where: { subscribed_to_id: workerId } });

    res.json({
      success: true,
      message: 'Subscription zrušen',
      subscriberCount
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ success: false, error: 'Něco se pokazilo' });
  }
});

// Check follow status
router.get('/follow-status/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const userId = req.query.userId || '1';

    const isFollowing = await Follow.findOne({
      where: {
        follower_id: userId,
        following_id: workerId
      }
    }) !== null;

    const isSubscribed = await Subscribe.findOne({
      where: {
        subscriber_id: userId,
        subscribed_to_id: workerId
      }
    }) !== null;

    const followerCount = await Follow.count({ where: { following_id: workerId } });
    const subscriberCount = await Subscribe.count({ where: { subscribed_to_id: workerId } });

    res.json({
      success: true,
      isFollowing,
      isSubscribed,
      followerCount,
      subscriberCount
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ success: false, error: 'Něco se pokazilo' });
  }
});

// Get followers list
router.get('/followers/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;

    const followerRecords = await Follow.findAll({
      where: { following_id: workerId },
      attributes: ['follower_id', 'created_at']
    });

    const subscriberRecords = await Subscribe.findAll({
      where: { subscribed_to_id: workerId },
      attributes: ['subscriber_id', 'created_at']
    });

    const followersList = followerRecords.map(f => ({
      userId: f.follower_id,
      followedAt: f.created_at
    }));

    const subscribersList = subscriberRecords.map(s => ({
      userId: s.subscriber_id,
      subscribedAt: s.created_at
    }));

    res.json({
      success: true,
      followers: followersList,
      subscribers: subscribersList,
      followerCount: followersList.length,
      subscriberCount: subscribersList.length
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ success: false, error: 'Něco se pokazilo' });
  }
});

module.exports = router;