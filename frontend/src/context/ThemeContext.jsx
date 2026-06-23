import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage or default to 'system'
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme ? savedTheme : 'system';
  });

  useEffect(() => {
    // Function to apply the actual theme to the document
    const applyTheme = (currentTheme) => {
      let activeTheme = currentTheme;
      if (currentTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = prefersDark ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', activeTheme);
    };

    // Apply the theme whenever 'theme' state changes
    applyTheme(theme);

    // Save user preference
    localStorage.setItem('app-theme', theme);

    // Listen for OS theme changes if set to 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
