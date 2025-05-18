import React, { useState, useEffect, useRef, useContext } from "react";
import "./MyNavbar.css";
import { Link } from "react-router-dom";
import { SettingsContext } from "../Settings/SettingsContext";

const MyNavbar = () => {
  const { startLiveTime, setStartLiveTime, phraseDelay, setPhraseDelay } =
    useContext(SettingsContext);
  const [openMenu, setOpenMenu] = useState(null);

  const navbarRef = useRef(null);
  const settingsRef = useRef(null);

  // Gestione input phraseDelay in secondi (salviamo in millisecondi)
  const handlePhraseDelayChange = (e) => {
    const seconds = parseInt(e.target.value, 10);
    if (!isNaN(seconds) && seconds >= 1 && seconds <= 60) {
      setPhraseDelay(seconds * 1000);
    }
  };

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Se il menu aperto è "settings" e clicchi fuori da settingsRef, chiudi
      if (
        openMenu === "settings" &&
        settingsRef.current &&
        !settingsRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }

      // Se il menu aperto è "file" e clicchi fuori da navbarRef, chiudi
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

  const handleTimerChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 999) {
      setStartLiveTime(value);
    }
  };

  return (
    <div ref={navbarRef} className="navbar d-flex justify-content-start">
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
            <Link to="/database" className="dropdown-item">
              Database
            </Link>
          </div>
        )}
      </div>

      <div className="menu-item" onClick={() => toggleMenu("settings")}>
        Impostazioni
      </div>

      {openMenu === "settings" && (
        <div ref={settingsRef} className="dropdown dropdown-settings">
          <div className="dropdown-item">Modalità Notte</div>
          <div className="dropdown-item d-flex align-items-center">
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
          <div className="dropdown-item d-flex align-items-center">
            Phrase Delay:
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
        </div>
      )}

      <div className="menu-item">?</div>
    </div>
  );
};

export default MyNavbar;
