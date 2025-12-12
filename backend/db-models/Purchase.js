const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Purchase = sequelize.define('Purchase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  buyer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Client který si koupil album'
  },
  seller_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Worker který album prodal'
  },
  album_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'albums',
      key: 'id'
    }
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'transactions',
      key: 'id'
    }
  },
  price_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Cena, kterou buyer zaplatil'
  },
  platform_commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '15% provize platformy'
  },
  seller_earnings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '85% výdělek pro workera'
  },
  access_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Datum expirace přístupu (pokud je časově omezený)'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Má uživatel stále přístup?'
  }
}, {
  tableName: 'purchases',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['buyer_id'] },
    { fields: ['seller_id'] },
    { fields: ['album_id'] },
    // Unique constraint - buyer nemůže koupit stejné album 2x
    { fields: ['buyer_id', 'album_id'], unique: true }
  ]
});

module.exports = Purchase;
