const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Album = sequelize.define('Album', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  worker_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cover_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL náhledového obrázku alba'
  },
  access_type: {
    type: DataTypes.ENUM('free', 'premium', 'private'),
    defaultValue: 'premium',
    comment: 'free = veřejné, premium = za peníze, private = pouze pro vybrané'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Cena za přístup k albu v Kč'
  },
  media_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Počet fotek/videí v albu'
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  purchases_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Kolik lidí si album koupilo'
  },
  total_revenue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Celkový výdělek z alba'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Zvýrazněné album (např. na homepage)'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array tagů např. ["sexy", "bikini", "beach"]'
  }
}, {
  tableName: 'albums',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['worker_id'] },
    { fields: ['access_type'] },
    { fields: ['is_active'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Album;
