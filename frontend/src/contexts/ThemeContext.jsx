import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Zkontrolovat localStorage nebo systémové preference
    const savedTheme = localStorage.getItem('fairworkers-theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Zkontrolovat systémové preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    // Uložit do localStorage
    localStorage.setItem('fairworkers-theme', theme);
    
    // Aplikovat třídu na root element
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // Nastavit meta theme-color pro mobilní prohlížeče
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const setDarkTheme = () => setTheme('dark');
  const setLightTheme = () => setTheme('light');

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      setDarkTheme,
      setLightTheme,
      isDark: theme === 'dark',
      isLight: theme === 'light'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme toggle komponenta
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center w-14 h-8 rounded-full
        bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800
        transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500
        ${className}
      `}
      aria-label={`Přepnout na ${theme === 'dark' ? 'světlý' : 'tmavý'} režim`}
    >
      {/* Track */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-20 dark:opacity-30" />
      </div>
      
      {/* Thumb */}
      <div
        className={`
          absolute left-1 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400
          shadow-lg transform transition-transform duration-300
          ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}
        `}
      >
        {/* Ikonka */}
        <div className="absolute inset-0 flex items-center justify-center">
          {theme === 'dark' ? (
            <span className="text-gray-900 text-sm">🌙</span>
          ) : (
            <span className="text-gray-900 text-sm">☀️</span>
          )}
        </div>
      </div>
      
      {/* Ikonky na pozadí */}
      <div className="flex items-center justify-between w-full px-2">
        <span className="text-gray-700 dark:text-gray-300 text-sm">☀️</span>
        <span className="text-gray-700 dark:text-gray-300 text-sm">🌙</span>
      </div>
    </button>
  );
};

// Theme switcher s více možnostmi
export const ThemeSwitcher = ({ className = '' }) => {
  const { theme, setDarkTheme, setLightTheme, toggleTheme } = useTheme();

  return (
    <div className={`bg-white/5 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 dark:border-white/10 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Téma</h3>
        <ThemeToggle />
      </div>
      
      <div className="space-y-3">
        <button
          onClick={setLightTheme}
          className={`
            w-full flex items-center justify-between p-3 rounded-xl transition
            ${theme === 'light' 
              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50' 
              : 'bg-white/5 hover:bg-white/10 border border-white/10'
            }
          `}
          aria-label="Přepnout na světlý režim"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center">
              <span className="text-xl">☀️</span>
            </div>
            <div className="text-left">
              <div className="font-bold">Světlý</div>
              <div className="text-sm opacity-70">Pro denní použití</div>
            </div>
          </div>
          {theme === 'light' && (
            <span className="text-yellow-400">✓</span>
          )}
        </button>
        
        <button
          onClick={setDarkTheme}
          className={`
            w-full flex items-center justify-between p-3 rounded-xl transition
            ${theme === 'dark' 
              ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50' 
              : 'bg-white/5 hover:bg-white/10 border border-white/10'
            }
          `}
          aria-label="Přepnout na tmavý režim"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-xl">🌙</span>
            </div>
            <div className="text-left">
              <div className="font-bold">Tmavý</div>
              <div className="text-sm opacity-70">Pro noční použití</div>
            </div>
          </div>
          {theme === 'dark' && (
            <span className="text-purple-400">✓</span>
          )}
        </button>
        
        <button
          onClick={toggleTheme}
          className="w-full p-3 bg-gradient-to-r from-primary-500/20 to-gold-500/20 hover:from-primary-500/30 hover:to-gold-500/30 rounded-xl border border-primary-500/30 transition"
          aria-label="Přepnout téma"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>🔄</span>
            <span className="font-bold">Přepnout automaticky</span>
          </div>
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10 text-sm opacity-70">
        <p>Téma se automaticky přizpůsobí vašim systémovým nastavením.</p>
      </div>
    </div>
  );
};

export default ThemeContext;
