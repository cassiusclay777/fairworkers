const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 5000]
    }
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  message_type: {
    type: DataTypes.ENUM('text', 'image', 'system'),
    defaultValue: 'text'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional message metadata (e.g., image URL, system message data)'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'idx_messages_sender_receiver',
      fields: ['sender_id', 'receiver_id']
    },
    {
      name: 'idx_messages_receiver_unread',
      fields: ['receiver_id', 'is_read']
    },
    {
      name: 'idx_messages_created_at',
      fields: ['created_at']
    },
    {
      name: 'idx_messages_conversation',
      fields: ['sender_id', 'receiver_id', 'created_at']
    }
  ]
});

module.exports = Message;
