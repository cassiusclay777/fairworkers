const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscribe = sequelize.define('Subscribe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subscriber_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  subscribed_to_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subscribes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['subscriber_id', 'subscribed_to_id']
    },
    {
      fields: ['subscriber_id']
    },
    {
      fields: ['subscribed_to_id']
    }
  ]
});

module.exports = Subscribe;
