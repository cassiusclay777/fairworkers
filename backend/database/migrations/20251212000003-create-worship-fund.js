'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('worship_fund', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Částka připsaná do solidarity fondu (0.5%)'
      },
      from_transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'transactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('platform_fee', 'donation', 'commission'),
        allowNull: false,
        defaultValue: 'platform_fee'
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      distributed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Zda byla částka již distribuována'
      },
      distributed_at: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('worship_fund', ['from_transaction_id']);
    await queryInterface.addIndex('worship_fund', ['distributed']);
    await queryInterface.addIndex('worship_fund', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('worship_fund');
  }
};
