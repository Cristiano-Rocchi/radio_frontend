import React, { useEffect, useState, useRef } from "react";
import "../Home/StartLive.css";
import liveImage from "../../Assets/Img/home.png";

const StartLive = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(500); // in secondi

  const phrases = [
    "Brew your Best Coffee...",
    "Hit up the local plug...",
    "Grab a Joint...",
    "Light it up and let it ride....",
    "Smoke, sip, and stay untouchable...",
    "No talkin’, just vibin’...",
  ];

  const typingSpeed = 60; // velocita effetto battitura
  const phraseDelay = 20000; // velocita alternanza frasi

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const typingTimeoutRef = useRef(null);
  const switchTimeoutRef = useRef(null);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onFinish]);

  // Digitazione sicura (niente intervalli multipli)
  const typePhrase = (text, i = 0) => {
    if (i <= text.length) {
      setDisplayedText(text.slice(0, i));
      typingTimeoutRef.current = setTimeout(
        () => typePhrase(text, i + 1),
        typingSpeed
      );
    } else {
      switchTimeoutRef.current = setTimeout(() => {
        const next = (currentPhraseIndex + 1) % phrases.length;
        setCurrentPhraseIndex(next);
      }, phraseDelay);
    }
  };

  // Avvia digitazione ogni volta che cambia frase
  useEffect(() => {
    clearTimeout(typingTimeoutRef.current);
    clearTimeout(switchTimeoutRef.current);
    typePhrase(phrases[currentPhraseIndex]);
    return () => {
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(switchTimeoutRef.current);
    };
  }, [currentPhraseIndex]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
      <div className="start-live-img">
        <img src={liveImage} alt="" />
      </div>
      <div className="start-live-overlay">
        <div className="live-label text-center">
          STAY CHILL... <br /> THE LIVE STARTS IN
        </div>
        <div className="countdown mb-5">{formatTime(timeLeft)}</div>
        <div className="intro-advice mt-3">
          <h3>
            {displayedText}
            <span className="blinking-cursor">|</span>
          </h3>
        </div>
      </div>
    </>
  );
};

export default StartLive;
