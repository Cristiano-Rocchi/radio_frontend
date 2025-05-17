import React, { useState, useEffect, useRef } from "react";
import "./MyNavbar.css";

const MyNavbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const navbarRef = useRef(null);

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // Chiude il menu se clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={navbarRef} className="navbar d-flex justify-content-start">
      <div className="menu-item ms-1" onClick={() => toggleMenu("file")}>
        File
        {openMenu === "file" && (
          <div className="dropdown dropdown-file">
            <div className="dropdown-item">Home</div>
            <div className="dropdown-item">Playlist</div>
            <div className="dropdown-item">Database</div>
          </div>
        )}
      </div>

      <div className="menu-item" onClick={() => toggleMenu("settings")}>
        Impostazioni
        {openMenu === "settings" && (
          <div className="dropdown dropdown-settings">
            <div className="dropdown-item">Quattro</div>
            <div className="dropdown-item">Cinque</div>
            <div className="dropdown-item">Sei</div>
          </div>
        )}
      </div>

      <div className="menu-item">?</div>
    </div>
  );
};

export default MyNavbar;
