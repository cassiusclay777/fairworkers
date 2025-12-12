import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

const Onboarding = ({ onComplete }) => {
  const { user } = useAuth();
  const { success, info } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [userData, setUserData] = useState({
    displayName: user?.display_name || '',
    bio: '',
    profileType: user?.role || 'worker',
    categories: [],
    priceRange: '500-1000',
    availability: 'flexible',
    paymentMethod: 'bank_transfer',
    notifications: true,
    privacyLevel: 'medium'
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Vítejte na FairWorkers! 🎉',
      description: 'Pojďme si nastavit váš profil, abyste mohli začít vydělávat.',
      icon: '👋',
      fields: []
    },
    {
      id: 'profile',
      title: 'Váš profil',
      description: 'Jak vás mají ostatní vidět?',
      icon: '👤',
      fields: [
        {
          id: 'displayName',
          label: 'Zobrazované jméno',
          type: 'text',
          placeholder: 'Jak vás mají ostatní oslovovat?',
          required: true
        },
        {
          id: 'bio',
          label: 'Krátký popis',
          type: 'textarea',
          placeholder: 'Řekněte něco o sobě...',
          required: false
        }
      ]
    },
    {
      id: 'type',
      title: 'Typ účtu',
      description: 'Jak budete na platformě působit?',
      icon: '🎯',
      fields: [
        {
          id: 'profileType',
          label: 'Jsem',
          type: 'radio',
          options: [
            { value: 'worker', label: 'Modelka / Poskytovatelka služeb', icon: '👩‍💼' },
            { value: 'client', label: 'Klient / Zákazník', icon: '👨‍💼' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'categories',
      title: 'Kategorie',
      description: 'Jaké služby nabízíte?',
      icon: '🏷️',
      fields: [
        {
          id: 'categories',
          label: 'Vyberte kategorie',
          type: 'checkbox',
          options: [
            { value: 'chat', label: 'Chat', icon: '💬' },
            { value: 'video_call', label: 'Video hovor', icon: '📹' },
            { value: 'photo_session', label: 'Focení', icon: '📸' },
            { value: 'consultation', label: 'Konzultace', icon: '💡' },
            { value: 'companionship', label: 'Společnost', icon: '👥' }
          ],
          required: false
        }
      ]
    },
    {
      id: 'pricing',
      title: 'Cenové rozpětí',
      description: 'Jakou cenu za služby požadujete?',
      icon: '💰',
      fields: [
        {
          id: 'priceRange',
          label: 'Cena za hodinu',
          type: 'select',
          options: [
            { value: '500-1000', label: '500 - 1 000 Kč' },
            { value: '1000-2000', label: '1 000 - 2 000 Kč' },
            { value: '2000-5000', label: '2 000 - 5 000 Kč' },
            { value: '5000+', label: '5 000 Kč a více' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'availability',
      title: 'Dostupnost',
      description: 'Kdy jste k dispozici?',
      icon: '📅',
      fields: [
        {
          id: 'availability',
          label: 'Moje dostupnost',
          type: 'radio',
          options: [
            { value: 'flexible', label: 'Flexibilní', icon: '🔄' },
            { value: 'weekdays', label: 'Pouze pracovní dny', icon: '🏢' },
            { value: 'weekends', label: 'Pouze víkendy', icon: '🌅' },
            { value: 'evenings', label: 'Večery', icon: '🌙' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'payment',
      title: 'Platby',
      description: 'Jak chcete dostávat peníze?',
      icon: '💳',
      fields: [
        {
          id: 'paymentMethod',
          label: 'Způsob výplaty',
          type: 'select',
          options: [
            { value: 'bank_transfer', label: 'Bankovní převod', icon: '🏦' },
            { value: 'paypal', label: 'PayPal', icon: '🔵' },
            { value: 'crypto', label: 'Kryptoměny', icon: '₿' }
          ],
          required: true
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Soukromí',
      description: 'Jak chcete chránit své údaje?',
      icon: '🔒',
      fields: [
        {
          id: 'privacyLevel',
          label: 'Úroveň soukromí',
          type: 'radio',
          options: [
            { value: 'low', label: 'Veřejný profil', icon: '🌐' },
            { value: 'medium', label: 'Omezený přístup', icon: '👁️' },
            { value: 'high', label: 'Maximální soukromí', icon: '🕶️' }
          ],
          required: true
        },
        {
          id: 'notifications',
          label: 'Notifikace',
          type: 'checkbox',
          options: [
            { value: true, label: 'Chci dostávat upozornění na nové zprávy a rezervace', icon: '🔔' }
          ],
          required: false
        }
      ]
    },
    {
      id: 'complete',
      title: 'Hotovo! 🎊',
      description: 'Váš profil je připraven. Můžete začít vydělávat!',
      icon: '🚀',
      fields: []
    }
  ];

  const handleInputChange = (fieldId, value) => {
    setUserData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    
    // Validace povinných polí
    const requiredFields = currentStepData.fields.filter(field => field.required);
    const isValid = requiredFields.every(field => {
      const value = userData[field.id];
      if (field.type === 'checkbox') {
        return Array.isArray(value) && value.length > 0;
      }
      return value && value.toString().trim() !== '';
    });

    if (!isValid && currentStepData.fields.length > 0) {
      info('Vyplňte prosím všechna povinná pole');
      return;
    }

    setCompletedSteps([...completedSteps, currentStepData.id]);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      // TODO: Odeslat data na backend
      success('Profil úspěšně nastaven!');
      onComplete(userData);
    } catch (error) {
      console.error('Chyba při ukládání profilu:', error);
    }
  };

  const renderField = (field) => {
    const value = userData[field.id];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="input-field"
            placeholder={field.placeholder}
            aria-label={field.label}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="input-field min-h-[100px] resize-none"
            placeholder={field.placeholder}
            aria-label={field.label}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="input-field"
            aria-label={field.label}
          >
            <option value="">Vyberte...</option>
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon && <span className="mr-2">{option.icon}</span>}
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3" role="radiogroup" aria-label={field.label}>
            {field.options.map(option => (
              <label
                key={option.value}
                className={`
                  flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition
                  ${value === option.value 
                    ? 'bg-primary-500/20 border-2 border-primary-500/50' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }
                `}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="sr-only"
                  aria-label={option.label}
                />
                <span className="text-2xl">{option.icon}</span>
                <span className="flex-1 font-medium">{option.label}</span>
                {value === option.value && (
                  <span className="text-primary-400">✓</span>
                )}
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3" role="group" aria-label={field.label}>
            {field.options.map(option => {
              const isChecked = field.id === 'notifications' 
                ? value === true
                : Array.isArray(value) && value.includes(option.value);
              
              return (
                <label
                  key={option.value}
                  className={`
                    flex items-center space-x-3 p-4 rounded-xl cursor-pointer transition
                    ${isChecked
                      ? 'bg-primary-500/20 border-2 border-primary-500/50' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      if (field.id === 'notifications') {
                        handleInputChange(field.id, e.target.checked);
                      } else {
                        const newValue = e.target.checked
                          ? [...(value || []), option.value]
                          : (value || []).filter(v => v !== option.value);
                        handleInputChange(field.id, newValue);
                      }
                    }}
                    className="sr-only"
                    aria-label={option.label}
                  />
                  <span className="text-2xl">{option.icon}</span>
                  <span className="flex-1 font-medium">{option.label}</span>
                  {isChecked && (
                    <span className="text-primary-400">✓</span>
                  )}
                </label>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-gold-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-4rem)]">
          {/* Step header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{currentStepData.icon}</div>
            <h2 className="text-3xl font-bold mb-2">{currentStepData.title}</h2>
            <p className="text-white/70">{currentStepData.description}</p>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`
                    w-3 h-3 rounded-full transition
                    ${index === currentStep 
                      ? 'bg-primary-400 scale-125' 
                      : completedSteps.includes(step.id) 
                        ? 'bg-green-400' 
                        : 'bg-white/20'
                    }
                  `}
                  aria-label={`Krok ${index + 1}: ${step.title}`}
                />
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="space-y-6 mb-8">
            {currentStepData.fields.map(field => (
              <div key={field.id}>
                <label className="block text-white/80 mb-3 font-medium">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t border-white/10">
            <button
              onClick={handleBack}
              className={`
                px-6 py-3 rounded-xl font-medium transition
                ${currentStep === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/20'
                }
              `}
              disabled={currentStep === 0}
              aria-label="Zpět na předchozí krok"
            >
              ← Zpět
            </button>

            <div className="flex space-x-3">
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition"
                  aria-label="Přeskočit tento krok"
                >
                  Přeskočit
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-gold-500 rounded-xl font-medium hover:opacity-90 transition"
                aria-label={currentStep === steps.length - 1 ? "Dokončit nastavení" : "Pokračovat na další krok"}
              >
                {currentStep === steps.length - 1 ? 'Dokončit 🚀' : 'Pokračovat →'}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center mt-6 text-white/40 text-sm">
            Krok {currentStep + 1} z {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
