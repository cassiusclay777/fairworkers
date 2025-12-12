class CommunitySystem {
  constructor() {
    this.supportCategories = [
      'bezpečnostní tipy',
      'právní poradenství', 
      'zdravotní otázky',
      'finanční poradenství',
      'emoční podpora',
      'technické problémy'
    ];
    this.moderators = [];
    this.resourceLinks = {
      legal: 'https://example.com/legal-resources',
      health: 'https://example.com/health-resources',
      safety: 'https://example.com/safety-resources'
    };
  }

  // Vytvoření anonymního příspěvku
  createAnonymousPost(title, content, category, tags = []) {
    if (!this.supportCategories.includes(category)) {
      return {
        success: false,
        error: `Neplatná kategorie. Povolené kategorie: ${this.supportCategories.join(', ')}`
      };
    }

    const post = {
      postId: `post_${Date.now()}`,
      title,
      content,
      category,
      tags,
      author: 'anonymní',
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      comments: [],
      isAnonymous: true
    };

    return {
      success: true,
      ...post,
      message: 'Příspěvek byl vytvořen anonymně'
    };
  }

  // Přidání komentáře
  addComment(postId, content, anonymous = true) {
    const comment = {
      commentId: `comment_${Date.now()}`,
      postId,
      content,
      author: anonymous ? 'anonymní' : 'uživatel',
      createdAt: new Date(),
      isAnonymous: anonymous
    };

    return {
      success: true,
      ...comment,
      message: 'Komentář byl přidán'
    };
  }

  // Systém hodnocení příspěvků
  ratePost(postId, rating) {
    const validRatings = ['upvote', 'downvote'];
    if (!validRatings.includes(rating)) {
      return {
        success: false,
        error: 'Neplatné hodnocení. Použijte: upvote nebo downvote'
      };
    }

    return {
      success: true,
      postId,
      rating,
      message: `Příspěvek byl ${rating === 'upvote' ? 'pozitivně' : 'negativně'} ohodnocen`
    };
  }

  // Vyhledávání v komunitě
  searchCommunity(query, category = null) {
    const searchResults = {
      query,
      category,
      results: [],
      totalFound: 0
    };

    return {
      success: true,
      ...searchResults,
      message: `Nalezeno ${searchResults.totalFound} výsledků pro "${query}"`
    };
  }

  // Získání oblíbených příspěvků
  getPopularPosts(limit = 10) {
    const popularPosts = [
      {
        postId: 'post_1',
        title: 'Jak zůstat v bezpečí při první schůzce',
        category: 'bezpečnostní tipy',
        upvotes: 45,
        commentCount: 12,
        createdAt: new Date(Date.now() - 86400000) // 1 den staré
      },
      {
        postId: 'post_2', 
        title: 'Daňové povinnosti - průvodce pro začátečníky',
        category: 'finanční poradenství',
        upvotes: 38,
        commentCount: 8,
        createdAt: new Date(Date.now() - 172800000) // 2 dny staré
      }
    ].slice(0, limit);

    return {
      success: true,
      posts: popularPosts,
      total: popularPosts.length
    };
  }

  // Zdroje a odkazy
  getCommunityResources() {
    return {
      success: true,
      resources: {
        legal: [
          { name: 'Právní poradna pro sex workery', url: this.resourceLinks.legal },
          { name: 'Práva pracovníků v ČR', url: 'https://example.com/labor-rights' }
        ],
        health: [
          { name: 'Zdravotní prevence a testování', url: this.resourceLinks.health },
          { name: 'Psychologická podpora', url: 'https://example.com/mental-health' }
        ],
        safety: [
          { name: 'Bezpečnostní protokoly', url: this.resourceLinks.safety },
          { name: 'Tísňové kontakty', url: 'https://example.com/emergency' }
        ]
      }
    };
  }

  // Moderátorské funkce
  moderatePost(postId, action, reason) {
    const validActions = ['approve', 'remove', 'warn'];
    if (!validActions.includes(action)) {
      return {
        success: false,
        error: `Neplatná akce. Povolené akce: ${validActions.join(', ')}`
      };
    }

    return {
      success: true,
      postId,
      action,
      reason,
      moderatedAt: new Date(),
      message: `Příspěvek byl ${action === 'remove' ? 'odstraněn' : action === 'warn' ? 'varován' : 'schválen'}`
    };
  }

  // Statistiky komunity
  getCommunityStats() {
    return {
      success: true,
      stats: {
        totalPosts: 156,
        totalComments: 892,
        activeUsers: 47,
        popularCategory: 'bezpečnostní tipy',
        postsThisMonth: 23,
        averageRating: 4.2
      },
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = CommunitySystem;