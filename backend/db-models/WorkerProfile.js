const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkerProfile = sequelize.define('WorkerProfile', {
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
  stage_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  languages: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('languages');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('languages', JSON.stringify(value || []));
    }
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  minimum_booking_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  accepts_new_clients: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  total_bookings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  response_time_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  safety_score: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.0
  },
  requires_verification: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  total_earnings: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  pending_payout: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  lifetime_earnings: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  }
}, {
  tableName: 'worker_profiles',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = WorkerProfile;
