import React, { useEffect, useState } from "react";
import "../Home/StartLive.css";

const StartLive = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(30); // 5 minuti in secondi

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

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="start-live-overlay">
      <div className="live-label">LIVE</div>
      <div className="countdown">{formatTime(timeLeft)}</div>
    </div>
  );
};

export default StartLive;
