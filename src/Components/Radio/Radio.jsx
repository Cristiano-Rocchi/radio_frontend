import React, { useRef } from "react";
import "./Radio.css";
import img1 from "../../Assets/Img/Radio1.png";

const Radio = () => {
  const containerRef = useRef(null);

  const handleDoubleClick = () => {
    const el = containerRef.current;
    if (!el) return;
    el.requestFullscreen?.() ||
      el.webkitRequestFullscreen?.() ||
      el.msRequestFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
      className="radio-container"
    >
      <img src={img1} alt="radio" className="radio-img" />
      <h1 className="titolo">TITOLOOOOOOOOOOOOOOO</h1>
      <h1 className="artista">ARTISTAAAAAAAAAA</h1>
      <h1 className="anno">ANNO</h1>
    </div>
  );
};

export default Radio;
