const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  worker_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  service_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'services',
      key: 'id'
    }
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'confirmed', 'completed', 'cancelled']]
    }
  },
  service_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  platform_commission: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  worker_earnings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  client_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  worker_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelled_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_bookings_worker_id',
      fields: ['worker_id']
    },
    {
      name: 'idx_bookings_client_id',
      fields: ['client_id']
    },
    {
      name: 'idx_bookings_status',
      fields: ['status']
    },
    {
      name: 'idx_bookings_start_time',
      fields: ['start_time']
    },
    {
      name: 'idx_bookings_worker_status',
      fields: ['worker_id', 'status']
    },
    {
      name: 'idx_bookings_client_status',
      fields: ['client_id', 'status']
    }
  ]
});

module.exports = Booking;
