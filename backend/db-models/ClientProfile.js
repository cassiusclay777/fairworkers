const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ClientProfile = sequelize.define('ClientProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verification_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  trusted_client: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  total_bookings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  cancelled_bookings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  no_show_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  trust_score: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.0
  }
}, {
  tableName: 'client_profiles',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ClientProfile;
