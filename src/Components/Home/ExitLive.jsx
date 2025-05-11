import React, { useEffect, useRef } from "react";
import liveImage from "../../Assets/Img/home.png";
import "./ExitLive.css";

import exitMusic from "../../Assets/Music/Diversified-Culture---Have-You-Ever-Seen-(Instrumental).mp3";

const ExitLive = () => {
  const audioRef = useRef(null);
  const exitMusicVolume = 0.4;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = exitMusicVolume;
    }
  }, []);

  return (
    <>
      <div className="start-live-img">
        <img src={liveImage} alt="" />
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
