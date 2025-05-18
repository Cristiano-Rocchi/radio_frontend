import React, { useEffect, useState, useRef, useContext } from "react";
import "../Home/StartLive.css";
import liveImage from "../../Assets/Img/home.png";
import introMusic from "../../Assets/Music/KRS-ONE---A-Friend-instrumental.mp3";
import { SettingsContext } from "../Settings/SettingsContext"; // importa il context

const StartLive = ({ onFinish }) => {
  const { startLiveTime } = useContext(SettingsContext); // ⬅️ prende dal context
  const [timeLeft, setTimeLeft] = useState(startLiveTime); // inizializza con valore globale

  const phrases = [
    "Brew your Best Coffee...",
    "Hit up the local plug...",
    "Grab a Joint...",
    "Light it up and let it ride....",
    "Smoke, sip, and stay untouchable...",
    "No talkin’, just vibin’...",
    "This is 'A Friend' — KRS-One on the beat, instrumental style.",
  ];

  const typingSpeed = 60;
  const { phraseDelay } = useContext(SettingsContext);

  const musicVolume = 0.4;

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const typingTimeoutRef = useRef(null);
  const switchTimeoutRef = useRef(null);
  const audioIntroRef = useRef(null);

  // ⏱️ Reimposta il timer ogni volta che cambia `startLiveTime` dal context
  useEffect(() => {
    setTimeLeft(startLiveTime);
  }, [startLiveTime]);

  // ⌛ Countdown
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

  // 🎵 Musica sottofondo
  useEffect(() => {
    const audio = audioIntroRef.current;

    if (audio && audio.paused && timeLeft > 0) {
      audio.volume = musicVolume;
      audio.play();
    }

    if (timeLeft === 15 && audio) {
      let start = null;
      const duration = 15000;
      const initialVolume = musicVolume;

      const fadeOut = (timestamp) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = initialVolume * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(fadeOut);
        } else {
          audio.pause();
          audio.currentTime = 0;
        }
      };

      requestAnimationFrame(fadeOut);
    }

    if (timeLeft <= 0 && audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [timeLeft]);

  // ⌨️ Digitazione frasi
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
      <audio ref={audioIntroRef} src={introMusic} loop />
    </>
  );
};

export default StartLive;
