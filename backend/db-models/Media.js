const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  album_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'albums',
      key: 'id'
    }
  },
  worker_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('image', 'video'),
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL souboru (S3, Cloudinary, local)'
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL náhledu (pro videa)'
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Velikost souboru v bytech'
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Délka videa v sekundách'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Pořadí v albu'
  },
  is_cover: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Je tohle cover image alba?'
  },
  blur_hash: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'BlurHash pro placeholder loading'
  }
}, {
  tableName: 'media',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['album_id'] },
    { fields: ['worker_id'] },
    { fields: ['type'] }
  ]
});

module.exports = Media;
