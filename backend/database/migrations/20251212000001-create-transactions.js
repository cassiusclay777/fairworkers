'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM(
          'deposit',
          'purchase',
          'withdrawal',
          'refund',
          'commission',
          'earning',
          'credit_topup',
          'booking_deposit',
          'payout',
          'service_payment'
        ),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Částka v Kč'
      },
      balance_before: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Zůstatek před transakcí'
      },
      balance_after: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Zůstatek po transakci'
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending'
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      related_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      related_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      payment_provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'ccbill, bank_transfer, atd.'
      },
      payment_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ccbill_ref: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'CCBill reference ID'
      },
      gateway: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'ccbill'
      },
      service_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('transactions', ['user_id']);
    await queryInterface.addIndex('transactions', ['type']);
    await queryInterface.addIndex('transactions', ['status']);
    await queryInterface.addIndex('transactions', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};
