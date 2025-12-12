import React from 'react';
import { Button } from "@/components/ui/button";

interface HeroButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function HeroButton({ children, onClick, disabled }: HeroButtonProps) {
  return (
    <Button
      className="
        w-full h-hero-button 
        bg-accent hover:bg-accent/90 
        text-white font-body font-500 
        text-body-16 
        rounded-lg
        transition-colors duration-200
        shadow-lg hover:shadow-xl
      "
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

export default HeroButton;