// ==============================
// ✅ INDICE
// 1. Import
// 2. Costanti e riferimenti
// 3. Effetti audio
// 4. Render
// ==============================

import React, { useEffect, useRef } from "react";
import liveImage from "../../Assets/Img/home1.png";
import "./ExitLive.css";
import exitMusic from "../../Assets/Music/Diversified-Culture---Have-You-Ever-Seen-(Instrumental).mp3";

// 2. Costanti e riferimenti
const ExitLive = () => {
  const audioRef = useRef(null);
  const exitMusicVolume = 0.4;

  // 3. Effetti audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = exitMusicVolume;
    }
  }, []);

  // 4. Render
  return (
    <>
      <div className="start-live-img">
        <img src={liveImage} alt="Live cover" />
      </div>

      <div className="start-live-overlay">
        <div className="exit-text text-center">
          <h1 className="mb-5">THE LIVE IS FINISH</h1>
          <h3>THANK YOU G . catch you on the next wave .</h3>
          <h4 className="mt-3">Stay Safe .</h4>
        </div>
      </div>

      <audio ref={audioRef} src={exitMusic} autoPlay loop />
    </>
  );
};

export default ExitLive;
