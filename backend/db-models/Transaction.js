const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'deposit',      // Dobití peněženky
      'purchase',     // Nákup (album, služba)
      'withdrawal',   // Výběr peněz (pro workers)
      'refund',       // Vrácení peněz
      'commission',   // Provize platformy (internal)
      'earning'       // Výdělek workera z služby
    ),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Částka v Kč'
  },
  balance_before: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Zůstatek před transakcí'
  },
  balance_after: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Zůstatek po transakci'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Popis transakce (např. "Nákup alba: Sexy fotky")'
  },
  // Reference na související záznamy
  related_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'ID alba, bookingu, nebo jiné entity'
  },
  related_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Typ entity (album, booking, service)'
  },
  // Platební brána
  payment_provider: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'ccbill, bank_transfer, atd.'
  },
  payment_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'External payment ID (CCBill Transaction ID)'
  },
  ccbill_ref: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'CCBill reference ID for tracking'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dodatečná data (webhook info, atd.)'
  }
}, {
  tableName: 'transactions',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Transaction;
