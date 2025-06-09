// ==============================
// ✅ INDICE
// 1. Import
// 2. Stato e riferimenti
// 3. Effetti
//   3.1 Caricamento playlist
//   3.2 Caricamento info album
//   3.3 Cleanup timer
//   3.4 Gestione fullscreen
// 4. Gestione player
//   4.1 Selezione playlist
//   4.2 Start con countdown
//   4.3 Fine countdown
//   4.4 Fine traccia (avanzamento)
//   4.5 OnPlay + fade / stop
// 5. Fetch album
// 6. Utility
//   6.1 Render skulls
// 7. Render
// ==============================

import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import { Button, Col, Container, Row } from "react-bootstrap";
import Homeimg from "../../Assets/Img/home1.png";
import Homeimg2 from "../../Assets/Img/home2.png";
import { Link, Navigate } from "react-router-dom";
import ReactHowler from "react-howler";
import StartLive from "../Home/StartLive";
import ExitLive from "../Home/ExitLive";

// 2. Stato e riferimenti
const Home = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  const playerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const stopTimerRef = useRef(null);

  const [showCountdown, setShowCountdown] = useState(false);
  const [pendingTrack, setPendingTrack] = useState(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [showExit, setShowExit] = useState(false);

  const [shouldGoFullscreen, setShouldGoFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Playlist attiva e tracce prev/next
  const currentPlaylist =
    playlists.find((p) => p.id === selectedPlaylistId) || null;

  const currentIdx =
    currentPlaylist?.tracks && Array.isArray(currentPlaylist.tracks)
      ? currentPlaylist.tracks.findIndex((t) => t.id === currentTrack?.id)
      : -1;

  const previousTrack =
    currentPlaylist && currentIdx > 0
      ? currentPlaylist.tracks[currentIdx - 1]
      : null;

  const nextTrack =
    currentPlaylist &&
    currentIdx !== null &&
    currentIdx < currentPlaylist.tracks.length - 1
      ? currentPlaylist.tracks[currentIdx + 1]
      : null;

  const [albumInfo, setAlbumInfo] = useState(null);

  // 3. Effetti

  // 3.1 Caricamento playlist
  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:3001/playlist");
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
      } else {
        console.error("Errore nel fetch delle playlist:", res.status);
      }
    } catch (error) {
      console.error("Errore nel fetch delle playlist:", error);
    }
  };

  // 3.2 Caricamento info album
  useEffect(() => {
    if (currentTrack && currentTrack.albumId) {
      fetchAlbum(currentTrack.albumId);
    }
  }, [currentTrack]);

  // 3.3 Cleanup timer
  useEffect(() => {
    // 7. Render
    return () => {
      clearTimeout(fadeTimerRef.current);
      clearTimeout(stopTimerRef.current);
    };
  }, [currentTrack]);

  // 3.4 Gestione fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = document.fullscreenElement !== null;
      setIsFullscreen(fs);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 4.1 Selezione playlist
  const handleSelectPlaylist = (id) => {
    const playlist = playlists.find((p) => p.id === id);
    if (playlist) {
      console.log("✅ Playlist selezionata:", playlist.name);
      setSelectedPlaylistId(id);
    } else {
      console.warn("❌ Playlist non trovata con ID:", id);
    }
  };

  // 4.2 Start con countdown
  const handlePlay = () => {
    if (
      !currentPlaylist ||
      !Array.isArray(currentPlaylist.tracks) ||
      currentPlaylist.tracks.length === 0
    )
      return;

    // Richiesta fullscreen SUBITO nel contesto del click utente
    const elem = document.documentElement; // o un container specifico se vuoi
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn("Fullscreen error:", err);
      });
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    setPendingTrack(currentPlaylist.tracks[0]);
    setShowCountdown(true);
  };

  // 4.3 Fine countdown
  const handleCountdownFinish = () => {
    setShowCountdown(false);
    if (pendingTrack) {
      setCurrentTrack(pendingTrack);
      setIsPlaying(true);
      setPendingTrack(null);
    }

    // Entra in fullscreen se richiesto
    if (shouldGoFullscreen) {
      const elem = document.documentElement; // tutto il documento
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setShouldGoFullscreen(false);
    }
  };

  // 4.4 Fine traccia \(avanzamento\)
  const handleEnded = () => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    if (!selectedPlaylistId) return;
    const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

    if (!currentTrack || !currentPlaylist) return;

    const currentIdx = currentPlaylist.tracks.findIndex(
      (t) => t.id === currentTrack.id
    );

    const nextTrack =
      Array.isArray(currentPlaylist.tracks) && currentIdx >= 0
        ? currentPlaylist.tracks[currentIdx + 1]
        : null;

    if (nextTrack) {
      console.log("➡️ Passo alla traccia successiva:", nextTrack.titolo);
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
    } else {
      console.log("✅ Playlist finita");
      setIsPlaying(false);
      setShowExit(true);
    }
  };

  // 4.5 OnPlay \+ fade / stop
  const handleOnPlay = () => {
    console.log("▶️ Traccia in riproduzione");

    if (playerRef.current) {
      const sound = playerRef.current.howler;
      const duration = sound.duration(); // durata in sec
      console.log(`🎵 Durata originale: ${duration}s`);

      const virtualEnd = duration - 10; // tagliamo 10 sec prima della fine
      const fadeStart = virtualEnd - 7; // fade-out inizia 7 sec prima della fine virtuale

      console.log(`⏳ Fade out a: ${fadeStart}s | Stop a: ${virtualEnd}s`);

      // Timer fade-out
      fadeTimerRef.current = setTimeout(() => {
        console.log("🔉 Avvio fade out di 7 secondi...");
        sound.fade(1.0, 0.0, 7000); // 7 sec di fade
      }, fadeStart * 1000);

      // Timer stop + avanzamento alla prossima traccia
      stopTimerRef.current = setTimeout(() => {
        console.log("⏭️ Fine virtuale: passo alla prossima traccia");
        handleEnded();
      }, virtualEnd * 1000);
    }
  };

  // 5. Fetch album
  const fetchAlbum = async (albumId) => {
    try {
      const response = await fetch(`http://localhost:3001/album/${albumId}`);
      if (response.ok) {
        const data = await response.json();
        setAlbumInfo(data);
      } else {
        console.error("Errore nel fetch album:", response.status);
      }
    } catch (error) {
      console.error("Errore nel fetch album:", error);
    }
  };

  // 6.1 Render skulls
  const renderSkulls = (rating) => {
    const skulls = [];
    const skullCount = rating;

    for (let i = 1; i <= 10; i++) {
      if (i <= skullCount) {
        skulls.push(
          <span key={i} className="skull full">
            💀
          </span>
        );
      } else {
        skulls.push(
          <span key={i} className="skull empty">
            💀
          </span>
        );
      }
    }
    return skulls;
  };

  return (
    <>
      {showCountdown ? (
        <StartLive onFinish={handleCountdownFinish} />
      ) : showExit ? (
        <ExitLive />
      ) : (
        <Container
          fluid
          className={`home-container p-0 m-0 ${
            isFullscreen ? "fullscreen-mode" : ""
          }`}
        >
          <Row>
            <Col xs={12} className="col-home">
              {/*-------- SEZIONE Grafica --------*/}
              <div className="card-home position-relative">
                <img className="first" src={Homeimg} alt="" />
                <img src={Homeimg2} className="second" alt="" />
                {/* TRACK INDEX */}
                <div className="track-index position-absolute d-flex justify-content-between align-items-center">
                  {previousTrack ? (
                    <h4 className="ms-4">
                      <span>Prev</span> {previousTrack.titolo}
                    </h4>
                  ) : (
                    <h4></h4>
                  )}
                </div>
                {/* ANIMAZIONE */}
                <div className="animation-index position-absolute d-flex justify-content-center align-items-center">
                  <div className="song-animation d-flex align-items-end">
                    {[...Array(13)].map((_, idx) => (
                      <div key={idx} className="bar"></div>
                    ))}
                  </div>
                </div>
                {/*-------- SEZIONE INFO --------*/}
                <div className="info position-absolute d-flex flex-column justify-content-between ">
                  <div className="mt-4 ">
                    <h1 className="text-center">
                      {currentTrack ? currentTrack.titolo : "Titolo"}
                    </h1>
                    <h2 className="text-center data">
                      {albumInfo ? albumInfo.date : "Data"}
                    </h2>

                    <h3 className="ms-4 mt-5">
                      <span>Artist:</span>
                      {albumInfo ? albumInfo.artist : "Artista"}
                    </h3>
                    <h3 className="ms-4 mt-4">
                      <span>Album:</span>{" "}
                      {albumInfo ? albumInfo.title : "Album"}
                    </h3>
                  </div>
                  <div className="mb-4 bar-wrapper">
                    <h2 className="ms-4">Hidden Gem Lvl</h2>
                    {currentTrack && (
                      <div className="d-flex align-items-center ms-4 mt-2 mb-5">
                        <div className="hidden-gem-bar-wrapper me-3">
                          <div
                            className="hidden-gem-bar-fill"
                            style={{ width: `${currentTrack.level}%` }}
                          ></div>
                          {currentTrack.level < 100 && (
                            <div
                              className="hidden-gem-bar-red"
                              style={{
                                left: `${currentTrack.level}%`,
                                width: `${100 - currentTrack.level}%`,
                              }}
                            ></div>
                          )}
                        </div>
                        <span className="level">{currentTrack.level} %</span>
                      </div>
                    )}
                    <h2 className="ms-4">Rating</h2>
                    {currentTrack && (
                      <div className="rating-skulls ms-4 mt-2">
                        {renderSkulls(currentTrack.rating)}{" "}
                        <span className="rating">{currentTrack.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-center">
            {" "}
            <Button
              variant="outline-secondary"
              className="mt-5 mb-4 fs-3"
              onClick={() => {
                const elem = document.querySelector(".col-home");
                if (elem && elem.requestFullscreen) {
                  elem.requestFullscreen();
                } else if (elem && elem.webkitRequestFullscreen) {
                  elem.webkitRequestFullscreen();
                }
              }}
            >
              FULLSCREEN
            </Button>
          </div>

          {/*-------- SEZIONE INFO --------*/}
          <Row>
            <Col xs={3}>
              <div className="playlist-home border border-2">
                <h5>Playlist disponibili</h5>
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="d-flex align-items-center mb-2"
                  >
                    <input
                      type="radio"
                      name="selectedPlaylist"
                      value={playlist.id}
                      checked={selectedPlaylistId === playlist.id}
                      onChange={() => handleSelectPlaylist(playlist.id)}
                    />

                    <span className="ms-2">
                      {playlist.name} {playlist.totalDuration}
                    </span>
                  </div>
                ))}

                {selectedPlaylistId !== null && (
                  <button className="btn btn-primary mt-3" onClick={handlePlay}>
                    ▶️ Play
                  </button>
                )}
              </div>
            </Col>
            <Col xs={4}>
              <div className="navigation-home border border-2 p-5">
                <div className="d-flex gap-2">
                  <Link to="/playlist">
                    <Button>Playlist Page</Button>
                  </Link>
                  <Link to="/database">
                    <Button>Database Page</Button>
                  </Link>
                  <Link to="/upload">
                    <Button>Upload Page</Button>
                  </Link>
                </div>
              </div>
            </Col>
            <Col xs={5}>Sezione Controllo</Col>
          </Row>

          {currentTrack && (
            <ReactHowler
              src={currentTrack.presignedUrl}
              playing={isPlaying}
              volume={1.0}
              onPlay={handleOnPlay}
              onEnd={handleEnded}
              ref={playerRef}
            />
          )}
        </Container>
      )}
    </>
  );
};

export default Home;
