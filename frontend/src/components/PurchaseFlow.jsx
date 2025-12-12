import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const PurchaseFlow = ({ album, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await api.get(`/api/users/${user.id}/wallet`);
      setWalletBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const processPayment = async () => {
    setLoading(true);
    setError('');

    try {
      let paymentResult;

      if (paymentMethod === 'wallet') {
        // Process wallet payment
        paymentResult = await api.post('/api/purchases', {
          albumId: album.id,
          buyerId: user.id,
          amount: album.price,
          paymentMethod: 'wallet'
        });
      } else {
        // Process Stripe payment
        paymentResult = await api.post('/api/payments/create-intent', {
          albumId: album.id,
          buyerId: user.id,
          amount: album.price,
          currency: 'czk'
        });

        // In a real app, you would integrate with Stripe Elements here
        // For demo, we'll simulate successful payment
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (paymentResult.data.success) {
        setStep(3); // Success step
        onSuccess && onSuccess();
      } else {
        setError(paymentResult.data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const topUpAndPurchase = () => {
    setStep(4); // Top-up flow
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-6xl">🛒</span>
        <h2 className="text-2xl font-bold mt-4">Purchase Album</h2>
        <p className="text-white/60">Review your purchase details</p>
      </div>

      <div className="bg-white/5 rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📷</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{album.title}</h3>
            <p className="text-white/60">by {album.worker.username}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/60">Album Price:</span>
            <span className="font-semibold">{album.price} Kč</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Platform Fee (15%):</span>
            <span className="text-white/60">{(album.price * 0.15).toFixed(0)} Kč</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-primary-400 text-lg">{album.price} Kč</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        className="btn-primary w-full"
      >
        Continue to Payment
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-6xl">💳</span>
        <h2 className="text-2xl font-bold mt-4">Payment Method</h2>
        <p className="text-white/60">Choose how you'd like to pay</p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            paymentMethod === 'wallet'
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-white/10 hover:border-white/20'
          }`}
          onClick={() => setPaymentMethod('wallet')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <div className="font-semibold">Wallet Balance</div>
                <div className="text-white/60">Use your existing balance</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-400">{walletBalance.toLocaleString()} Kč</div>
              <div className="text-sm text-white/60">Available</div>
            </div>
          </div>
          
          {paymentMethod === 'wallet' && walletBalance < album.price && (
            <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">⚠️</span>
                <div>
                  <div className="font-semibold text-yellow-400">Insufficient Balance</div>
                  <div className="text-sm text-yellow-300/80">
                    You need {album.price - walletBalance} Kč more
                  </div>
                </div>
              </div>
              <button
                onClick={topUpAndPurchase}
                className="btn-primary w-full mt-2 text-sm"
              >
                Top Up & Purchase
              </button>
            </div>
          )}
        </div>

        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            paymentMethod === 'stripe'
              ? 'border-primary-500 bg-primary-500/10'
              : 'border-white/10 hover:border-white/20'
          }`}
          onClick={() => setPaymentMethod('stripe')}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-xl">💳</span>
            </div>
            <div>
              <div className="font-semibold">Credit/Debit Card</div>
              <div className="text-white/60">Pay with Stripe</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">❌</span>
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => setStep(1)}
          className="btn-secondary flex-1"
        >
          Back
        </button>
        <button
          onClick={processPayment}
          disabled={loading || (paymentMethod === 'wallet' && walletBalance < album.price)}
          className="btn-primary flex-1"
        >
          {loading ? 'Processing...' : 'Complete Purchase'}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <span className="text-3xl">✅</span>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold">Purchase Successful!</h2>
        <p className="text-white/60 mt-2">
          You now have access to "{album.title}"
        </p>
      </div>

      <div className="bg-white/5 rounded-lg p-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-white/60">Album:</span>
            <span className="font-semibold">{album.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Artist:</span>
            <span>{album.worker.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Amount Paid:</span>
            <span className="font-bold text-primary-400">{album.price} Kč</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Transaction ID:</span>
            <span className="text-sm font-mono">TX_{Date.now()}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onClose}
          className="btn-secondary flex-1"
        >
          Close
        </button>
        <button
          onClick={() => {
            onClose();
            // Navigate to album view
          }}
          className="btn-primary flex-1"
        >
          View Album
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-6xl">💰</span>
        <h2 className="text-2xl font-bold mt-4">Top Up Required</h2>
        <p className="text-white/60">Add funds to complete your purchase</p>
      </div>

      <div className="bg-white/5 rounded-lg p-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/60">Current Balance:</span>
            <span className="font-semibold">{walletBalance} Kč</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Album Price:</span>
            <span className="font-semibold">{album.price} Kč</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3">
            <span className="font-semibold">Amount Needed:</span>
            <span className="font-bold text-primary-400">
              {Math.max(0, album.price - walletBalance)} Kč
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[100, 500, 1000, 2000].map(amount => (
          <button
            key={amount}
            onClick={() => {
              // In real app, this would trigger top-up
              setWalletBalance(walletBalance + amount);
              setStep(2);
            }}
            className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-center"
          >
            <div className="text-lg font-bold text-primary-400">+{amount} Kč</div>
          </button>
        ))}
      </div>

      <button
        onClick={() => setStep(2)}
        className="btn-secondary w-full"
      >
        Back to Payment
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default PurchaseFlow;
