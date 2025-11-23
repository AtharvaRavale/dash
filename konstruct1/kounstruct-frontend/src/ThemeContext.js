import React, { createContext, useContext, useState, useEffect } from "react";

// ---- 1. CONTEXT ----
export const ThemeContext = createContext();

// ---- 2. PROVIDER ----
export const ThemeProvider = ({ children }) => {
  // You can use 'light' or 'dark' as your starting theme
  const [theme, setTheme] = useState(() => localStorage.getItem("APP_THEME") || "light");

  useEffect(() => {
    localStorage.setItem("APP_THEME", theme);
    // Optional: set a class or data-attribute on <body> for global CSS
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ---- 3. HOOK ----
export const useTheme = () => useContext(ThemeContext);
