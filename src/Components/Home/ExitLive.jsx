import React from "react";
import liveImage from "../../Assets/Img/home.png";
import "./ExitLive.css";

const ExitLive = () => {
  return (
    <>
      <div className="start-live-img">
        <img src={liveImage} alt="" />
      </div>
      <div className="start-live-overlay">
        <div className="exit-text text-center">
          {" "}
          <h1 className="mb-5">THE LIVE IS FINISH</h1>
          <h3>THANK YOU G . catch you on the next wave .</h3>
          <h4 className="mt-3">Stay Safe .</h4>
        </div>
      </div>
    </>
  );
};

export default ExitLive;
