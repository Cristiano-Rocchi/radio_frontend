// ==============================
// ✅ INDICE
// 1. Import e context
// 2. Riferimenti e stato menu
// 3. Gestione eventi
//   3.1 Toggle menu
//   3.2 Click fuori dal menu
//   3.3 Gestione input: startLiveTime
//   3.4 Gestione input: phraseDelay
// 4. Render navbar con dropdown
// ==============================

import React, { useState, useEffect, useRef, useContext } from "react";
import "./MyNavbar.css";
import { Link } from "react-router-dom";
import { SettingsContext } from "../Settings/SettingsContext";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css"; // Stile base

// 1. Import e context
const MyNavbar = () => {
  const {
    startLiveTime,
    setStartLiveTime,
    phraseDelay,
    setPhraseDelay,
    darkMode,
    setDarkMode,
    albumFormCount,
    setAlbumFormCount,
    songFormCount,
    setSongFormCount,
  } = useContext(SettingsContext);

  // 2. Riferimenti e stato menu
  const [openMenu, setOpenMenu] = useState(null);
  const navbarRef = useRef(null);
  const settingsRef = useRef(null);

  // 3. Gestione eventi

  // 3.1 Toggle menu
  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // 3.2 Click fuori dal menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenu === "settings" &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
      if (
        openMenu === "file" &&
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  // 3.3 Gestione input: startLiveTime (in secondi)
  const handleTimerChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 999) {
      setStartLiveTime(value);
    }
  };

  // 3.4 Gestione input: phraseDelay (visualizza in sec, salva in ms)
  const handlePhraseDelayChange = (e) => {
    const seconds = parseInt(e.target.value, 10);
    if (!isNaN(seconds) && seconds >= 1 && seconds <= 60) {
      setPhraseDelay(seconds * 1000);
    }
  };

  // 4. Render navbar con dropdown
  return (
    <div
      ref={navbarRef}
      className={`navbar d-flex justify-content-start ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      {/* === 4.1 File === */}
      <div className="menu-item ms-1" onClick={() => toggleMenu("file")}>
        File
        {openMenu === "file" && (
          <div className="dropdown dropdown-file">
            <Link to="/" className="dropdown-item">
              Home
            </Link>
            <Link to="/playlist" className="dropdown-item">
              Playlist
            </Link>
            <Link to="/upload" className="dropdown-item">
              Upload
            </Link>
            <Link to="/database" className="dropdown-item">
              Database
            </Link>
          </div>
        )}
      </div>

      {/* === 4.2 Menu Impostazioni === */}
      <div className="menu-item" onClick={() => toggleMenu("settings")}>
        Impostazioni
      </div>

      {openMenu === "settings" && (
        <div ref={settingsRef} className="dropdown dropdown-settings">
          {/*--- Modalità Notet--- */}

          <div className="dropdown-item d-flex align-items-center gap-3">
            Modalità Notte
            <label className="switch ms-2">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="dropdown-section-title ms-2 mt-2 border-bottom">
            Pre Live
          </div>

          {/*---Timer ----*/}

          <Tippy content="Regola timer dello start prelive" placement="top">
            <div className="dropdown-item d-flex align-items-center ">
              Timer Start Live:
              <input
                type="number"
                min="1"
                max="999"
                value={startLiveTime}
                onChange={handleTimerChange}
                className="ms-2"
                style={{ width: "70px" }}
              />
              <span className="ms-2">sec</span>
            </div>
          </Tippy>

          {/* ---- Delay Frasi---- */}
          <div className="dropdown-item d-flex align-items-center">
            <Tippy
              content="Intervallo tra una frase e l'altra durante il pre-live"
              placement="top"
            >
              <span>Phrase Delay:</span>
            </Tippy>
            <input
              type="number"
              min="1"
              max="60"
              value={phraseDelay / 1000}
              onChange={handlePhraseDelayChange}
              className="ms-2"
              style={{ width: "70px" }}
            />
            <span className="ms-2">sec</span>
          </div>

          {/* -----Numero Form Album----- */}
          <div className="dropdown-section-title mt-2 ms-2">Upload</div>
          <div className="dropdown-item d-flex align-items-center">
            <Tippy
              content="Numero massimo di upload per gli album"
              placement="top"
            >
              <span>Form Album:</span>
            </Tippy>
            <input
              type="number"
              min="1"
              max="500"
              value={albumFormCount}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= 500) {
                  setAlbumFormCount(value);
                }
              }}
              className="ms-2"
              style={{ width: "70px" }}
            />
          </div>
          {/* -----Numero Form Canzoni----- */}
          <div className="dropdown-item d-flex align-items-center">
            <Tippy
              content="Numero massimo di upload per singola traccia"
              placement="top"
            >
              <span>Form Song:</span>
            </Tippy>
            <input
              type="number"
              min="1"
              max="500"
              value={songFormCount}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value >= 1 && value <= 500) {
                  setSongFormCount(value);
                }
              }}
              className="ms-2"
              style={{ width: "70px" }}
            />
          </div>
        </div>
      )}

      {/* === 4.3 Menu Aiuto === */}
      <div className="menu-item">?</div>
    </div>
  );
};

export default MyNavbar;
