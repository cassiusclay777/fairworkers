const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorshipFund = sequelize.define('WorshipFund', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Částka připsaná do solidarity fondu (0.5%)'
  },
  fromTransactionId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'from_transaction_id',
    references: {
      model: 'transactions',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('platform_fee', 'donation', 'commission'),
    allowNull: false,
    defaultValue: 'platform_fee'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  distributed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Zda byla částka již distribuována'
  },
  distributedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'distributed_at'
  }
}, {
  tableName: 'worship_fund',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['from_transaction_id'] },
    { fields: ['distributed'] },
    { fields: ['created_at'] }
  ]
});

module.exports = WorshipFund;
