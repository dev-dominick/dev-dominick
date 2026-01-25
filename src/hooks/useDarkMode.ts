"use client";

import { useState, useEffect } from "react";

export function useDarkMode() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      return savedMode === "true";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Save preference
    localStorage.setItem("darkMode", String(darkMode));

    // Update document class
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggle = () => setDarkMode(!darkMode);

  return { darkMode, isDark: darkMode, setDarkMode, toggleDarkMode: toggle, toggle, mounted };
}
