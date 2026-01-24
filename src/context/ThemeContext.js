import React, { createContext, useContext, useState, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to light
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem('hexToBin_darkMode');
      return stored ? JSON.parse(stored) : false;
    } catch (e) {
      return false;
    }
  });

  // Save theme preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hexToBin_darkMode', JSON.stringify(isDark));
    } catch (e) {
      console.warn('Failed to save dark mode preference:', e);
    }
  }, [isDark]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Theme values
  const theme = {
    isDark,
    toggleTheme,
    colors: {
      // Background colors
      primary: isDark ? '#1a1a1a' : '#ffffff',
      secondary: isDark ? '#2a2a2a' : '#f8fafc',
      tertiary: isDark ? '#3a3a3a' : '#f1f5f9',
      accent: isDark ? '#4a4a4a' : '#e2e8f0',

      // Text colors
      text: {
        primary: isDark ? '#ffffff' : '#1f2937',
        secondary: isDark ? '#d1d5db' : '#374151',
        tertiary: isDark ? '#9ca3af' : '#6b7280',
        muted: isDark ? '#6b7280' : '#64748b'
      },

      // Border colors
      border: {
        primary: isDark ? '#4b5563' : '#d1d5db',
        secondary: isDark ? '#374151' : '#e2e8f0',
        accent: isDark ? '#6b7280' : '#3b82f6'
      },

      // Status colors
      success: {
        bg: isDark ? '#064e3b' : '#ecfdf5',
        border: isDark ? '#047857' : '#10b981',
        text: isDark ? '#34d399' : '#065f46'
      },
      warning: {
        bg: isDark ? '#78350f' : '#fef3c7',
        border: isDark ? '#d97706' : '#f59e0b',
        text: isDark ? '#fbbf24' : '#92400e'
      },
      info: {
        bg: isDark ? '#0c4a6e' : '#e0f2fe',
        border: isDark ? '#0284c7' : '#0ea5e9',
        text: isDark ? '#38bdf8' : '#0c4a6e'
      },
      error: {
        bg: isDark ? '#7f1d1d' : '#fef2f2',
        border: isDark ? '#dc2626' : '#ef4444',
        text: isDark ? '#f87171' : '#991b1b'
      },

      // Interactive elements
      button: {
        primary: {
          bg: isDark ? '#3b82f6' : '#3b82f6',
          hover: isDark ? '#2563eb' : '#2563eb',
          text: '#ffffff'
        },
        secondary: {
          bg: isDark ? '#374151' : '#6b7280',
          hover: isDark ? '#4b5563' : '#4b5563',
          text: '#ffffff'
        },
        danger: {
          bg: isDark ? '#dc2626' : '#ef4444',
          hover: isDark ? '#b91c1c' : '#dc2626',
          text: '#ffffff'
        }
      },

      // Input elements
      input: {
        bg: isDark ? '#374151' : '#ffffff',
        border: isDark ? '#4b5563' : '#d1d5db',
        focus: isDark ? '#3b82f6' : '#3b82f6',
        text: isDark ? '#ffffff' : '#1f2937',
        placeholder: isDark ? '#9ca3af' : '#6b7280'
      },

      // Hex display specific
      hexDisplay: {
        container: isDark ? '#2d3748' : '#454857',
        button: {
          bg: isDark ? 'linear-gradient(180deg, #48bb78, #38a169)' : 'linear-gradient(180deg, #95d891, #74bbad)',
          active: isDark ? 'linear-gradient(180deg, #2f855a, #38a169)' : 'linear-gradient(180deg, #568054, #74bbad)',
          text: isDark ? '#1a202c' : '#2d3748'
        },
        input: {
          bg: isDark ? '#1a202c' : '#ffffff',
          text: isDark ? '#ffffff' : '#000000'
        },
        label: isDark ? '#e2e8f0' : '#eef1ef'
      }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};