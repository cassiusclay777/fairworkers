const express = require('express');
const router = express.Router();
const { sequelize, Album, Media, Purchase, User, Wallet, Transaction } = require('../db-models');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { Op } = require('sequelize');
const { upload, uploadsDir, thumbnailsDir, isImage, isVideo, validateFileSize } = require('../middleware/upload');
const { processImage, getImageDimensions } = require('../utils/imageProcessor');
const path = require('path');

// GET /api/albums - Seznam alb s filtrováním
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      worker_id,
      access_type,
      min_price,
      max_price,
      tags,
      is_featured,
      limit = 20,
      offset = 0,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const whereClause = { is_active: true };

    // Filtry
    if (worker_id) whereClause.worker_id = worker_id;
    if (access_type) whereClause.access_type = access_type;
    if (is_featured !== undefined) whereClause.is_featured = is_featured === 'true';

    // Cena
    if (min_price || max_price) {
      whereClause.price = {};
      if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
      if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
    }

    // Tags (JSON obsahuje nějaký tag)
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      whereClause.tags = {
        [Op.contains]: tagArray
      };
    }

    const albums = await Album.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'username', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort, order.toUpperCase()]]
    });

    const total = await Album.count({ where: whereClause });

    // Připojit info o tom, jestli má user přístup
    const albumsWithAccess = await Promise.all(albums.map(async (album) => {
      let hasAccess = album.access_type === 'free';
      let hasPurchased = false;

      if (req.user && album.access_type === 'premium') {
        const purchase = await Purchase.findOne({
          where: {
            buyer_id: req.user.id,
            album_id: album.id,
            is_active: true
          }
        });
        if (purchase) {
          hasAccess = true;
          hasPurchased = true;
        }
      }

      // Pokud je to vlastník alba, má vždy přístup
      if (req.user && album.worker_id === req.user.id) {
        hasAccess = true;
      }

      return {
        id: album.id,
        worker_id: album.worker_id,
        worker: album.worker,
        title: album.title,
        description: album.description,
        cover_image_url: album.cover_image_url,
        access_type: album.access_type,
        price: parseFloat(album.price),
        media_count: album.media_count,
        views_count: album.views_count,
        purchases_count: album.purchases_count,
        total_revenue: parseFloat(album.total_revenue),
        is_featured: album.is_featured,
        tags: album.tags,
        created_at: album.created_at,
        has_access: hasAccess,
        has_purchased: hasPurchased
      };
    }));

    res.json({
      success: true,
      albums: albumsWithAccess,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání alb'
    });
  }
});

// GET /api/albums/:id - Detail alba
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: User,
          as: 'worker',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album nenalezeno'
      });
    }

    // Zkontrolovat přístup
    let hasAccess = album.access_type === 'free';
    let hasPurchased = false;

    if (req.user) {
      if (album.access_type === 'premium') {
        const purchase = await Purchase.findOne({
          where: {
            buyer_id: req.user.id,
            album_id: album.id,
            is_active: true
          }
        });
        if (purchase) {
          hasAccess = true;
          hasPurchased = true;
        }
      }

      // Vlastník má vždy přístup
      if (album.worker_id === req.user.id) {
        hasAccess = true;
      }
    }

    // Inkrementovat views_count
    await album.increment('views_count');

    res.json({
      success: true,
      album: {
        id: album.id,
        worker_id: album.worker_id,
        worker: album.worker,
        title: album.title,
        description: album.description,
        cover_image_url: album.cover_image_url,
        access_type: album.access_type,
        price: parseFloat(album.price),
        media_count: album.media_count,
        views_count: album.views_count + 1,
        purchases_count: album.purchases_count,
        total_revenue: parseFloat(album.total_revenue),
        is_featured: album.is_featured,
        tags: album.tags,
        created_at: album.created_at,
        has_access: hasAccess,
        has_purchased: hasPurchased
      }
    });
  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání alba'
    });
  }
});

// POST /api/albums - Vytvořit nové album (pouze worker)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Ověřit, že je uživatel worker
    if (req.user.role !== 'worker') {
      return res.status(403).json({
        success: false,
        error: 'Pouze workeři mohou vytvářet alba'
      });
    }

    const { title, description, cover_image_url, access_type, price, tags } = req.body;

    // Validace
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Název alba je povinný'
      });
    }

    if (access_type && !['free', 'premium', 'private'].includes(access_type)) {
      return res.status(400).json({
        success: false,
        error: 'Neplatný typ přístupu'
      });
    }

    if (access_type === 'premium' && (!price || price <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'Premium album musí mít stanovenou cenu'
      });
    }

    // Vytvořit album
    const album = await Album.create({
      worker_id: req.user.id,
      title: title.trim(),
      description: description?.trim(),
      cover_image_url,
      access_type: access_type || 'premium',
      price: price ? parseFloat(price) : 0.00,
      tags: tags || null
    });

    res.status(201).json({
      success: true,
      message: 'Album úspěšně vytvořeno!',
      album: {
        id: album.id,
        title: album.title,
        description: album.description,
        cover_image_url: album.cover_image_url,
        access_type: album.access_type,
        price: parseFloat(album.price),
        media_count: album.media_count,
        created_at: album.created_at
      }
    });
  } catch (error) {
    console.error('Create album error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při vytváření alba'
    });
  }
});

// PUT /api/albums/:id - Upravit album
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, cover_image_url, access_type, price, tags, is_active, is_featured } = req.body;

    const album = await Album.findOne({ where: { id } });

    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album nenalezeno'
      });
    }

    // IDOR ochrana - pouze vlastník může upravovat
    if (album.worker_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Nemáte oprávnění upravovat toto album'
      });
    }

    // Aktualizovat pole
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim();
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;
    if (access_type !== undefined) updates.access_type = access_type;
    if (price !== undefined) updates.price = parseFloat(price);
    if (tags !== undefined) updates.tags = tags;
    if (is_active !== undefined) updates.is_active = is_active;
    if (is_featured !== undefined) updates.is_featured = is_featured;

    await album.update(updates);

    res.json({
      success: true,
      message: 'Album aktualizováno',
      album: {
        id: album.id,
        title: album.title,
        description: album.description,
        cover_image_url: album.cover_image_url,
        access_type: album.access_type,
        price: parseFloat(album.price),
        tags: album.tags,
        is_active: album.is_active,
        is_featured: album.is_featured
      }
    });
  } catch (error) {
    console.error('Update album error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při aktualizaci alba'
    });
  }
});

// DELETE /api/albums/:id - Smazat album
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findOne({ where: { id } });

    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album nenalezeno'
      });
    }

    // IDOR ochrana
    if (album.worker_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Nemáte oprávnění smazat toto album'
      });
    }

    // Soft delete (nastavit is_active na false)
    await album.update({ is_active: false });

    res.json({
      success: true,
      message: 'Album bylo smazáno'
    });
  } catch (error) {
    console.error('Delete album error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při mazání alba'
    });
  }
});

// POST /api/albums/:id/purchase - Koupit album z peněženky
router.post('/:id/purchase', authenticateToken, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Získat album
    const album = await Album.findOne({
      where: { id, is_active: true },
      transaction: t
    });

    if (!album) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        error: 'Album nenalezeno'
      });
    }

    // Kontrola - nemůžeš koupit vlastní album
    if (album.worker_id === req.user.id) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: 'Nemůžete koupit vlastní album'
      });
    }

    // Kontrola - pouze premium alba se dají koupit
    if (album.access_type !== 'premium') {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: 'Toto album nelze zakoupit'
      });
    }

    // Kontrola - už vlastníš?
    const existingPurchase = await Purchase.findOne({
      where: {
        buyer_id: req.user.id,
        album_id: album.id
      },
      transaction: t
    });

    if (existingPurchase) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: 'Toto album již vlastníte'
      });
    }

    // Získat peněženku kupce
    let buyerWallet = await Wallet.findOne({
      where: { user_id: req.user.id },
      transaction: t
    });

    if (!buyerWallet) {
      buyerWallet = await Wallet.create({
        user_id: req.user.id,
        balance: 0.00,
        currency: 'CZK'
      }, { transaction: t });
    }

    const price = parseFloat(album.price);
    const buyerBalance = parseFloat(buyerWallet.balance);

    // Kontrola zůstatku
    if (buyerBalance < price) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        error: `Nedostatečný zůstatek. Potřebujete ${price} Kč, máte ${buyerBalance} Kč.`
      });
    }

    // Kalkulace provize (15% platforma, 85% worker)
    const platformCommission = price * 0.15;
    const sellerEarnings = price * 0.85;

    // Získat peněženku prodávajícího
    let sellerWallet = await Wallet.findOne({
      where: { user_id: album.worker_id },
      transaction: t
    });

    if (!sellerWallet) {
      sellerWallet = await Wallet.create({
        user_id: album.worker_id,
        balance: 0.00,
        currency: 'CZK'
      }, { transaction: t });
    }

    // Balances
    const buyerBalanceAfter = buyerBalance - price;
    const sellerBalanceBefore = parseFloat(sellerWallet.balance);
    const sellerBalanceAfter = sellerBalanceBefore + sellerEarnings;

    // 1. Vytvořit transakci pro kupce (purchase)
    const buyerTransaction = await Transaction.create({
      user_id: req.user.id,
      type: 'purchase',
      amount: -price,
      balance_before: buyerBalance,
      balance_after: buyerBalanceAfter,
      status: 'completed',
      description: `Nákup alba: ${album.title}`,
      related_type: 'album',
      related_id: album.id
    }, { transaction: t });

    // 2. Vytvořit transakci pro prodávajícího (earning)
    const sellerTransaction = await Transaction.create({
      user_id: album.worker_id,
      type: 'earning',
      amount: sellerEarnings,
      balance_before: sellerBalanceBefore,
      balance_after: sellerBalanceAfter,
      status: 'completed',
      description: `Prodej alba: ${album.title}`,
      related_type: 'album',
      related_id: album.id
    }, { transaction: t });

    // 3. Vytvořit Purchase záznam
    const purchase = await Purchase.create({
      buyer_id: req.user.id,
      seller_id: album.worker_id,
      album_id: album.id,
      transaction_id: buyerTransaction.id,
      price_paid: price,
      platform_commission: platformCommission,
      seller_earnings: sellerEarnings,
      is_active: true
    }, { transaction: t });

    // 4. Aktualizovat peněženky
    await buyerWallet.update({
      balance: buyerBalanceAfter,
      total_spent: parseFloat(buyerWallet.total_spent) + price
    }, { transaction: t });

    await sellerWallet.update({
      balance: sellerBalanceAfter
    }, { transaction: t });

    // 5. Aktualizovat statistiky alba
    await album.update({
      purchases_count: album.purchases_count + 1,
      total_revenue: parseFloat(album.total_revenue) + price
    }, { transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Album úspěšně zakoupeno!',
      purchase: {
        id: purchase.id,
        album_id: album.id,
        album_title: album.title,
        price_paid: price,
        your_new_balance: buyerBalanceAfter,
        purchased_at: purchase.created_at
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Purchase album error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při nákupu alba'
    });
  }
});

// GET /api/albums/:id/media - Získat média v albu
router.get('/:id/media', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findOne({
      where: { id, is_active: true }
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album nenalezeno'
      });
    }

    // Kontrola přístupu
    let hasAccess = album.access_type === 'free';

    if (album.access_type === 'premium') {
      const purchase = await Purchase.findOne({
        where: {
          buyer_id: req.user.id,
          album_id: album.id,
          is_active: true
        }
      });
      if (purchase) hasAccess = true;
    }

    // Vlastník má vždy přístup
    if (album.worker_id === req.user.id) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Nemáte přístup k tomuto albu. Kupte si ho pro plný přístup.'
      });
    }

    // Načíst média
    const media = await Media.findAll({
      where: { album_id: id, is_active: true },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });

    res.json({
      success: true,
      album: {
        id: album.id,
        title: album.title
      },
      media: media.map(m => ({
        id: m.id,
        type: m.type,
        file_url: m.file_url,
        thumbnail_url: m.thumbnail_url,
        file_size: m.file_size,
        mime_type: m.mime_type,
        width: m.width,
        height: m.height,
        duration: m.duration,
        blur_hash: m.blur_hash,
        display_order: m.display_order,
        created_at: m.created_at
      }))
    });
  } catch (error) {
    console.error('Get album media error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při načítání médií'
    });
  }
});

// GET /api/albums/:id/access - Zkontrolovat přístup k albu
router.get('/:id/access', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findOne({
      where: { id, is_active: true }
    });

    if (!album) {
      return res.status(404).json({
        success: false,
        error: 'Album nenalezeno'
      });
    }

    let hasAccess = album.access_type === 'free';
    let hasPurchased = false;
    let isOwner = album.worker_id === req.user.id;

    if (album.access_type === 'premium') {
      const purchase = await Purchase.findOne({
        where: {
          buyer_id: req.user.id,
          album_id: album.id,
          is_active: true
        }
      });
      if (purchase) {
        hasAccess = true;
        hasPurchased = true;
      }
    }

    if (isOwner) {
      hasAccess = true;
    }

    res.json({
      success: true,
      album_id: album.id,
      has_access: hasAccess,
      has_purchased: hasPurchased,
      is_owner: isOwner,
      access_type: album.access_type,
      price: parseFloat(album.price)
    });
  } catch (error) {
    console.error('Check album access error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při kontrole přístupu'
    });
  }
});

// POST /api/albums/:id/upload-media - Nahrát média do alba
router.post('/:id/upload-media', authenticateToken, upload.array('media', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Žádné soubory nebyly nahrány'
      });
    }

    // Získat album
    const album = await Album.findOne({ where: { id, is_active: true } });

    if (!album) {
      // Vymazat nahrané soubory
      files.forEach(file => {
        const fs = require('fs');
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      return res.status(404).json({
        success: false,
        error: 'Album nenalezeno'
      });
    }

    // IDOR ochrana - pouze vlastník může nahrávat
    if (album.worker_id !== req.user.id) {
      // Vymazat nahrané soubory
      files.forEach(file => {
        const fs = require('fs');
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      return res.status(403).json({
        success: false,
        error: 'Nemáte oprávnění nahrávat média do tohoto alba'
      });
    }

    const uploadedMedia = [];
    const errors = [];

    // Zpracovat každý soubor
    for (const file of files) {
      try {
        // Validovat velikost
        const sizeValidation = validateFileSize(file);
        if (!sizeValidation.valid) {
          errors.push({ filename: file.originalname, error: sizeValidation.error });
          const fs = require('fs');
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          continue;
        }

        const mediaType = isImage(file.mimetype) ? 'image' : 'video';
        let width = null;
        let height = null;
        let thumbnailUrl = null;

        // URL pro soubory (relativní cesta)
        const fileUrl = `/uploads/media/${file.filename}`;

        // Zpracovat obrázky
        if (mediaType === 'image') {
          const thumbnailFilename = `thumb_${file.filename}`;
          const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

          // Process image and create thumbnail
          const imageData = await processImage(file.path, thumbnailPath);
          width = imageData.width;
          height = imageData.height;
          thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
        } else {
          // Pro videa - získat metadata (budoucí implementace s ffmpeg)
          // Prozatím nastavíme základní hodnoty
          thumbnailUrl = null; // TODO: Generate video thumbnail
        }

        // Vytvořit Media záznam
        const media = await Media.create({
          album_id: album.id,
          worker_id: req.user.id,
          type: mediaType,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          filename: file.filename,
          file_size: file.size,
          mime_type: file.mimetype,
          width,
          height,
          order: album.media_count // Přidat na konec
        });

        uploadedMedia.push({
          id: media.id,
          type: mediaType,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl,
          filename: file.originalname,
          size: file.size
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        errors.push({ filename: file.originalname, error: fileError.message });
        // Vymazat soubor při chybě
        const fs = require('fs');
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    // Aktualizovat media_count v albu
    await album.update({
      media_count: album.media_count + uploadedMedia.length
    });

    res.json({
      success: true,
      message: `Úspěšně nahráno ${uploadedMedia.length} souborů`,
      uploaded: uploadedMedia,
      errors: errors.length > 0 ? errors : undefined,
      album: {
        id: album.id,
        media_count: album.media_count + uploadedMedia.length
      }
    });
  } catch (error) {
    console.error('Upload media error:', error);
    // Vymazat všechny nahrané soubory při chybě
    if (req.files) {
      const fs = require('fs');
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({
      success: false,
      error: 'Chyba při nahrávání médií'
    });
  }
});

module.exports = router;
