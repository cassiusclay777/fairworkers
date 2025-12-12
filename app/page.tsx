'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { HeroButton } from '@/components/HeroButton'
import { GoogleAuthButton } from '@/components/GoogleAuthButton'

// Dynamic imports for performance optimization
const BalanceDisplay = dynamic(() => import('@/components/BalanceDisplay'), { 
  ssr: false,
  loading: () => <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
})

const VoiceInput = dynamic(() => import('@/components/VoiceInput'), { 
  ssr: false 
})

export default function Home() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [email, setEmail] = useState('')

  const handleGoogleAuth = () => {
    // Google OAuth implementation
    console.log('Google auth initiated')
  }

  const handlePhoneAuth = () => {
    // Phone authentication implementation
    console.log('Phone auth initiated')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            onLoadedData={() => setIsVideoLoaded(true)}
            style={{ 
              opacity: isVideoLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease-in'
            }}
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            {/* Fallback image */}
          </video>
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="font-heading font-900 text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
            Práce na míru.<br />
            <span className="text-accent">Bez čekání.</span>
          </h1>
          <p className="font-body font-500 text-xl md:text-2xl mb-8 opacity-90">
            Zaregistruj se, pracuj, dostaň peníze.
          </p>
          <div className="max-w-md mx-auto">
            <HeroButton onClick={() => console.log('Hero CTA clicked')}>
              Začít (1 klik)
            </HeroButton>
          </div>
        </div>
      </section>

      {/* PROOF SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Screenshots */}
            <div className="space-y-6">
              <div className="rounded-2xl shadow-2xl overflow-hidden">
                <img 
                  src="/screenshots/registration.jpg" 
                  alt="Rychlá registrace"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div className="rounded-2xl shadow-2xl overflow-hidden">
                <img 
                  src="/screenshots/earnings.jpg" 
                  alt="Výdělky uživatelů"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Social Proof */}
            <div className="space-y-8">
              <div className="text-center md:text-left">
                <div className="inline-block bg-accent text-white px-6 py-3 rounded-full font-body font-900 text-2xl mb-4">
                  85% vydělávajících
                </div>
                <p className="font-body text-gray-600 text-lg">
                  Naši uživatelé začínají vydělávat během prvního týdne
                </p>
              </div>

              {/* Real Numbers */}
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="font-heading font-900 text-3xl text-primary">500+</div>
                  <div className="font-body text-gray-600">aktivních prací</div>
                </div>
                <div>
                  <div className="font-heading font-900 text-3xl text-primary">95%</div>
                  <div className="font-body text-gray-600">spokojených</div>
                </div>
                <div>
                  <div className="font-heading font-900 text-3xl text-primary">2h</div>
                  <div className="font-body text-gray-600">průměrná práce</div>
                </div>
                <div>
                  <div className="font-heading font-900 text-3xl text-primary">24/7</div>
                  <div className="font-body text-gray-600">support</div>
                </div>
              </div>

              {/* Balance Display Demo */}
              <BalanceDisplay balance={12500} isAnimating={true} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 max-w-md">
          <div className="text-center mb-8">
            <h2 className="font-heading font-900 text-3xl mb-4">
              Začněte ještě dnes
            </h2>
            <p className="font-body opacity-80">
              Registrace zabere méně než minutu
            </p>
          </div>

          {/* Auth Options */}
          <div className="space-y-4">
            <GoogleAuthButton onClick={handleGoogleAuth} />
            
            {/* Phone Input Backup */}
            <div className="bg-white rounded-lg p-4">
              <label className="block text-primary font-body font-500 mb-2">
                Nebo zadejte telefon
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+420 123 456 789"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button 
                  onClick={handlePhoneAuth}
                  className="bg-accent text-white px-4 py-2 rounded-lg font-body font-500"
                >
                  Odeslat
                </button>
              </div>
            </div>

            {/* Voice Input Demo */}
            <div className="bg-white rounded-lg p-4">
              <label className="block text-primary font-body font-500 mb-2">
                Nebo řekněte číslo
              </label>
              <VoiceInput 
                onTranscript={(text) => setEmail(text)}
                onError={(error) => console.error('Voice error:', error)}
              />
            </div>
          </div>

          {/* Privacy Disclaimer */}
          <div className="mt-6 text-center">
            <p className="font-body text-sm opacity-60">
              Vaše data jsou v bezpečí. Nikdy je nesdílíme s třetími stranami.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}