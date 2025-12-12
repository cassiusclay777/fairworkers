import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Wallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceResponse, transactionsResponse] = await Promise.all([
        api.get(`/api/users/${user.id}/wallet`),
        api.get(`/api/users/${user.id}/transactions`)
      ]);
      
      setBalance(balanceResponse.data.balance || 0);
      setTransactions(transactionsResponse.data.transactions || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Demo data
      setTransactions([
        {
          id: 1,
          type: 'purchase',
          amount: -299,
          description: 'Album: Summer Collection',
          date: new Date().toISOString(),
          status: 'completed'
        },
        {
          id: 2,
          type: 'topup',
          amount: 1000,
          description: 'Wallet top-up',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const topUpWallet = async () => {
    try {
      await api.post(`/api/users/${user.id}/wallet/topup`, {
        amount: topUpAmount
      });
      
      setShowTopUp(false);
      setTopUpAmount(100);
      fetchWalletData();
      alert('Wallet topped up successfully!');
    } catch (error) {
      console.error('Error topping up wallet:', error);
      alert('Error topping up wallet. Please try again.');
    }
  };

  const withdrawFunds = async (amount) => {
    try {
      await api.post(`/api/users/${user.id}/wallet/withdraw`, { amount });
      fetchWalletData();
      alert('Withdrawal request submitted!');
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      alert('Error withdrawing funds. Please check your balance.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-800 rounded-lg mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Wallet</h1>
          <p className="text-white/60">Manage your balance and transaction history</p>
        </div>

        {/* Balance Card */}
        <div className="card bg-gradient-to-br from-primary-500/20 to-purple-500/20 border-primary-500/30 mb-8">
          <div className="text-center p-8">
            <div className="text-white/60 text-lg mb-2">Current Balance</div>
            <div className="text-6xl font-bold text-primary-400 mb-6">
              {balance.toLocaleString()} Kč
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setShowTopUp(true)}
                className="btn-primary"
              >
                💳 Top Up Wallet
              </button>
              <button 
                onClick={() => withdrawFunds(balance)}
                className="btn-secondary"
                disabled={balance <= 0}
              >
                💰 Withdraw Funds
              </button>
            </div>
          </div>
        </div>

        {/* Quick Top Up Options */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Top Up</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[100, 500, 1000, 2000].map(amount => (
              <button
                key={amount}
                onClick={() => {
                  setTopUpAmount(amount);
                  setShowTopUp(true);
                }}
                className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center"
              >
                <div className="text-lg font-bold text-primary-400">{amount} Kč</div>
                <div className="text-sm text-white/60">Add to wallet</div>
              </button>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">💸</span>
              <h3 className="text-xl font-bold mt-4">No transactions yet</h3>
              <p className="text-white/60 mt-2">
                Your transaction history will appear here once you start using the platform.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map(transaction => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'topup' ? 'bg-green-500/20' :
                      transaction.type === 'purchase' ? 'bg-red-500/20' :
                      transaction.type === 'withdrawal' ? 'bg-blue-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <span className="text-xl">
                        {transaction.type === 'topup' ? '⬆️' :
                         transaction.type === 'purchase' ? '🛒' :
                         transaction.type === 'withdrawal' ? '⬇️' : '💰'}
                      </span>
                    </div>
                    
                    <div>
                      <div className="font-semibold">{transaction.description}</div>
                      <div className="text-sm text-white/60">
                        {new Date(transaction.date).toLocaleDateString()} • 
                        <span className={`ml-2 ${
                          transaction.status === 'completed' ? 'text-green-400' :
                          transaction.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-lg font-bold ${
                    transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} Kč
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Up Modal */}
        {showTopUp && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Top Up Wallet</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Amount (Kč)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(parseInt(e.target.value) || 0)}
                    className="input"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {[100, 500, 1000, 2000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount)}
                      className={`p-3 rounded-lg text-center transition-colors ${
                        topUpAmount === amount 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {amount} Kč
                    </button>
                  ))}
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Current Balance:</span>
                    <span className="font-semibold">{balance.toLocaleString()} Kč</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>New Balance:</span>
                    <span className="font-semibold text-primary-400">
                      {(balance + topUpAmount).toLocaleString()} Kč
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={topUpWallet}
                    className="btn-primary flex-1"
                  >
                    Confirm Top Up
                  </button>
                  <button 
                    onClick={() => setShowTopUp(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="text-xs text-white/40 text-center">
                  Payments are processed securely through our payment partners.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;
