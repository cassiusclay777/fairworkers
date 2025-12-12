const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchmakingFeedback = sequelize.define('MatchmakingFeedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  worker_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  match_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'AI-calculated match score (0-100)'
  },
  feedback: {
    type: DataTypes.ENUM('accept', 'reject', 'interested', 'not_interested'),
    allowNull: false,
    comment: 'User feedback on the match suggestion'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'matchmaking_feedback',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['worker_id']
    },
    {
      fields: ['user_id', 'worker_id']
    }
  ]
});

module.exports = MatchmakingFeedback;
