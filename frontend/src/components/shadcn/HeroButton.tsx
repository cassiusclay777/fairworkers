import React from 'react'

type HeroButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

export function HeroButton({ children, className = '', ...rest }: HeroButtonProps) {
  return (
    <button
      {...rest}
      className={
        [
          'w-full h-16 flex items-center justify-center rounded-lg select-none',
          'bg-accent text-white',
          'font-medium text-base leading-tight',
          'shadow-md focus:outline-none focus:ring-4 focus:ring-accent/30',
          className,
        ].filter(Boolean).join(' ')
      }
    >
      {children}
    </button>
  )
}

export default HeroButton
