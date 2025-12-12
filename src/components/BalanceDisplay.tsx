import { useState, useEffect } from 'react';

interface BalanceDisplayProps {
  balance: number;
  currency?: string;
  isAnimating?: boolean;
}

export function BalanceDisplay({ balance, currency = 'Kč', isAnimating = true }: BalanceDisplayProps) {
  const [displayBalance, setDisplayBalance] = useState(0);

  useEffect(() => {
    if (!isAnimating) {
      setDisplayBalance(balance);
      return;
    }

    const startBalance = Math.max(0, balance - 100);
    const duration = 1000; // 1 second
    const steps = 60; // 60fps
    const increment = (balance - startBalance) / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const newBalance = Math.min(
        startBalance + (increment * currentStep),
        balance
      );
      
      setDisplayBalance(Math.floor(newBalance));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayBalance(balance);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [balance, isAnimating]);

  return (
    <div className="text-center p-6 bg-primary rounded-lg">
      <h2 className="text-sm font-body font-500 text-gray-400 mb-2">
        Your Balance
      </h2>
      <div className="font-heading font-900 text-4xl text-white">
        {displayBalance.toLocaleString()} {currency}
      </div>
    </div>
  );
}

export default BalanceDisplay;