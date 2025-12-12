const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
const WorkerProfile = require('./WorkerProfile');
const ClientProfile = require('./ClientProfile');
const Service = require('./Service');
const Booking = require('./Booking');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const Album = require('./Album');
const Media = require('./Media');
const Purchase = require('./Purchase');
const Message = require('./Message');
const WorshipFund = require('./WorshipFund');
const Follow = require('./Follow');
const Subscribe = require('./Subscribe');
const MatchmakingPreference = require('./MatchmakingPreference');
const MatchmakingFeedback = require('./MatchmakingFeedback');

// Define associations
User.hasOne(WorkerProfile, {
  foreignKey: 'user_id',
  as: 'workerProfile',
  onDelete: 'CASCADE'
});

WorkerProfile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasOne(ClientProfile, {
  foreignKey: 'user_id',
  as: 'clientProfile',
  onDelete: 'CASCADE'
});

ClientProfile.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Service, {
  foreignKey: 'worker_id',
  as: 'services',
  onDelete: 'CASCADE'
});

Service.belongsTo(User, {
  foreignKey: 'worker_id',
  as: 'worker'
});

User.hasMany(Booking, {
  foreignKey: 'worker_id',
  as: 'workerBookings',
  onDelete: 'CASCADE'
});

User.hasMany(Booking, {
  foreignKey: 'client_id',
  as: 'clientBookings',
  onDelete: 'CASCADE'
});

Booking.belongsTo(User, {
  foreignKey: 'worker_id',
  as: 'worker'
});

Booking.belongsTo(User, {
  foreignKey: 'client_id',
  as: 'client'
});

Service.hasMany(Booking, {
  foreignKey: 'service_id',
  as: 'bookings'
});

Booking.belongsTo(Service, {
  foreignKey: 'service_id',
  as: 'service'
});

// Wallet associations
User.hasOne(Wallet, {
  foreignKey: 'user_id',
  as: 'wallet',
  onDelete: 'CASCADE'
});

Wallet.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Transaction associations
User.hasMany(Transaction, {
  foreignKey: 'user_id',
  as: 'transactions'
});

Transaction.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Album associations
User.hasMany(Album, {
  foreignKey: 'worker_id',
  as: 'albums',
  onDelete: 'CASCADE'
});

Album.belongsTo(User, {
  foreignKey: 'worker_id',
  as: 'worker'
});

// Media associations
Album.hasMany(Media, {
  foreignKey: 'album_id',
  as: 'media',
  onDelete: 'CASCADE'
});

Media.belongsTo(Album, {
  foreignKey: 'album_id',
  as: 'album'
});

User.hasMany(Media, {
  foreignKey: 'worker_id',
  as: 'media'
});

Media.belongsTo(User, {
  foreignKey: 'worker_id',
  as: 'worker'
});

// Purchase associations
User.hasMany(Purchase, {
  foreignKey: 'buyer_id',
  as: 'purchases'
});

Purchase.belongsTo(User, {
  foreignKey: 'buyer_id',
  as: 'buyer'
});

User.hasMany(Purchase, {
  foreignKey: 'seller_id',
  as: 'sales'
});

Purchase.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller'
});

Album.hasMany(Purchase, {
  foreignKey: 'album_id',
  as: 'purchases'
});

Purchase.belongsTo(Album, {
  foreignKey: 'album_id',
  as: 'album'
});

Purchase.belongsTo(Transaction, {
  foreignKey: 'transaction_id',
  as: 'transaction'
});

// Message associations
User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sentMessages',
  onDelete: 'CASCADE'
});

User.hasMany(Message, {
  foreignKey: 'receiver_id',
  as: 'receivedMessages',
  onDelete: 'CASCADE'
});

Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender'
});

Message.belongsTo(User, {
  foreignKey: 'receiver_id',
  as: 'receiver'
});

// WorshipFund associations
Transaction.hasMany(WorshipFund, {
  foreignKey: 'from_transaction_id',
  as: 'worshipFunds'
});

WorshipFund.belongsTo(Transaction, {
  foreignKey: 'from_transaction_id',
  as: 'transaction'
});

// Follow associations
User.hasMany(Follow, {
  foreignKey: 'follower_id',
  as: 'following',
  onDelete: 'CASCADE'
});

User.hasMany(Follow, {
  foreignKey: 'following_id',
  as: 'followers',
  onDelete: 'CASCADE'
});

Follow.belongsTo(User, {
  foreignKey: 'follower_id',
  as: 'follower'
});

Follow.belongsTo(User, {
  foreignKey: 'following_id',
  as: 'followedUser'
});

// Subscribe associations
User.hasMany(Subscribe, {
  foreignKey: 'subscriber_id',
  as: 'subscriptions',
  onDelete: 'CASCADE'
});

User.hasMany(Subscribe, {
  foreignKey: 'subscribed_to_id',
  as: 'subscribers',
  onDelete: 'CASCADE'
});

Subscribe.belongsTo(User, {
  foreignKey: 'subscriber_id',
  as: 'subscriber'
});

Subscribe.belongsTo(User, {
  foreignKey: 'subscribed_to_id',
  as: 'subscribedTo'
});

// MatchmakingPreference associations
User.hasOne(MatchmakingPreference, {
  foreignKey: 'user_id',
  as: 'matchmakingPreference',
  onDelete: 'CASCADE'
});

MatchmakingPreference.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// MatchmakingFeedback associations
User.hasMany(MatchmakingFeedback, {
  foreignKey: 'user_id',
  as: 'matchmakingFeedbackGiven',
  onDelete: 'CASCADE'
});

User.hasMany(MatchmakingFeedback, {
  foreignKey: 'worker_id',
  as: 'matchmakingFeedbackReceived',
  onDelete: 'CASCADE'
});

MatchmakingFeedback.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

MatchmakingFeedback.belongsTo(User, {
  foreignKey: 'worker_id',
  as: 'worker'
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  User,
  WorkerProfile,
  ClientProfile,
  Service,
  Booking,
  Wallet,
  Transaction,
  Album,
  Media,
  Purchase,
  Message,
  WorshipFund,
  Follow,
  Subscribe,
  MatchmakingPreference,
  MatchmakingFeedback
};
