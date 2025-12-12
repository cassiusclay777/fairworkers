const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchmakingPreference = sequelize.define('MatchmakingPreference', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  preferences: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    comment: 'User preferences for AI matchmaking (location, services, budget, etc.)'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'matchmaking_preferences',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id']
    }
  ]
});

module.exports = MatchmakingPreference;
