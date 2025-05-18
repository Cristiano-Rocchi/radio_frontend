// ==============================
// ✅ INDICE
// 1. Creazione del contesto
// 2. Valori di default
// 3. Stato e persistenza
//    3.1 startLiveTime
//    3.2 phraseDelay
//    3.3 darkMode
// 4. Provider export
// ==============================

import { createContext, useState, useEffect } from "react";

// 1. Creazione del contesto
export const SettingsContext = createContext();

// 2. Valori di default
const defaultStartTime = 120;
const defaultPhraseDelay = 10000;

export const SettingsProvider = ({ children }) => {
  // 3. Stato e persistenza

  // 3.1 startLiveTime
  const [startLiveTime, setStartLiveTime] = useState(() => {
    const saved = localStorage.getItem("startLiveTime");
    return saved ? parseInt(saved, 10) : defaultStartTime;
  });

  useEffect(() => {
    localStorage.setItem("startLiveTime", startLiveTime);
  }, [startLiveTime]);

  // 3.2 phraseDelay
  const [phraseDelay, setPhraseDelay] = useState(() => {
    const saved = localStorage.getItem("phraseDelay");
    return saved ? parseInt(saved, 10) : defaultPhraseDelay;
  });

  useEffect(() => {
    localStorage.setItem("phraseDelay", phraseDelay);
  }, [phraseDelay]);

  // 3.3 darkMode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true"; // default: false
  });

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // 4. Provider export
  return (
    <SettingsContext.Provider
      value={{
        startLiveTime,
        setStartLiveTime,
        phraseDelay,
        setPhraseDelay,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
