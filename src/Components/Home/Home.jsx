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
import Logo from "../../Assets/Img/logo.png";
import Skit from "../../Assets/Music/radio_pizzamafia_skit.mp3";

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
  const [virtualQueue, setVirtualQueue] = useState([]);

  const [showSkitOverlay, setShowSkitOverlay] = useState(false);
  const [currentVirtualIndex, setCurrentVirtualIndex] = useState(0);

  // Playlist attiva e tracce prev/next
  const currentPlaylist =
    playlists.find((p) => p.id === selectedPlaylistId) || null;

  const currentIdx =
    currentPlaylist?.tracks && Array.isArray(currentPlaylist.tracks)
      ? currentPlaylist.tracks.findIndex((t) =>
          currentTrack && currentTrack !== "skit"
            ? t.id === currentTrack.track.id
            : false
        )
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

  // 2.2 Costruzione della coda virtuale
  const buildVirtualQueue = (tracks) => {
    const queue = [];
    // Skit iniziale
    queue.push({ isSkit: true });
    for (let i = 0; i < tracks.length; i++) {
      queue.push({ isSkit: false, track: tracks[i] });

      // numero di skit ogni tracce
      const isNotLast = i < tracks.length - 1;
      if ((i + 1) % 5 === 0 && isNotLast) {
        queue.push({ isSkit: true });
      }
    }
    return queue;
  };

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
    if (
      currentTrack &&
      currentTrack !== "skit" &&
      currentTrack.track &&
      currentTrack.track.albumId
    ) {
      fetchAlbum(currentTrack.track.albumId);
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

    // Genera la coda con skit alternati
    const virtual = buildVirtualQueue(currentPlaylist.tracks);
    setVirtualQueue(virtual);

    // Richiesta fullscreen SUBITO nel contesto del click utente
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn("Fullscreen error:", err);
      });
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    // Imposta come primo elemento della coda lo skit o la prima traccia
    setPendingTrack(virtual[0]);
    setShowCountdown(true);
  };

  // 4.3 Fine countdown
  const handleCountdownFinish = () => {
    setShowCountdown(false);
    if (pendingTrack) {
      // Trova la posizione del pendingTrack nella virtualQueue
      const startIndex = virtualQueue.findIndex((item) =>
        pendingTrack.isSkit
          ? item.isSkit
          : item.track?.id === pendingTrack.track?.id
      );

      setCurrentTrack(pendingTrack.isSkit ? "skit" : pendingTrack);
      setCurrentVirtualIndex(startIndex); // 👈 salva la posizione nella queue
      setIsPlaying(true);
      setPendingTrack(null);
    }

    // Entra in fullscreen se richiesto
    if (shouldGoFullscreen) {
      const elem = document.documentElement;
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
    if (currentTrack === "skit") {
      setTimeout(() => {
        setShowSkitOverlay(false);
      }, 3000);
    }

    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    if (!virtualQueue || virtualQueue.length === 0 || currentTrack === null) {
      return;
    }

    const nextIndex = currentVirtualIndex + 1;
    const nextItem = virtualQueue[nextIndex];

    if (nextItem) {
      setCurrentTrack(nextItem.isSkit ? "skit" : nextItem);
      setCurrentVirtualIndex(nextIndex); // 🔁 aggiorna l'indice corrente
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

    // Se è uno skit
    if (currentTrack === "skit") {
      console.log("🎙️ È uno skit, nessun fade o taglio.");
      setShowSkitOverlay(true); // mostra overlay
      return;
    }

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
                {showSkitOverlay && (
                  <div className="skit-overlay fade-in-out d-flex justify-content-center align-items-center">
                    <img src={Logo} alt="Logo" className="skit-logo" />
                  </div>
                )}

                <img className="first" src={Homeimg} alt="" />
                <img src={Homeimg2} className="second" alt="" />
                {/* TRACK INDEX */}
                <div className="track-index position-absolute d-flex justify-content-between align-items-center">
                  {previousTrack && currentTrack !== "skit" ? (
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
                      {currentTrack && currentTrack !== "skit"
                        ? currentTrack.track.titolo
                        : "Titolo"}
                    </h1>
                    <h3 className="text-center data">
                      {albumInfo ? albumInfo.date : "Data"}
                    </h3>

                    <h3 className="ms-4 mt-5">
                      <span>Artist:</span>
                      {albumInfo && currentTrack !== "skit"
                        ? albumInfo.artist
                        : "Artista"}
                    </h3>
                    <h3 className="ms-4 mt-4">
                      <span>Album:</span>{" "}
                      {albumInfo ? albumInfo.title : "Album"}
                    </h3>
                  </div>
                  <div className="mb-4 bar-wrapper">
                    <h2 className="ms-4">Hidden Gem Lvl</h2>
                    {currentTrack && currentTrack !== "skit" && (
                      <div className="d-flex align-items-center ms-4 mt-2 mb-5">
                        <div className="hidden-gem-bar-wrapper me-3">
                          <div
                            className="hidden-gem-bar-fill"
                            style={{ width: `${currentTrack.track.level}%` }}
                          ></div>
                          {currentTrack.track.level < 100 && (
                            <div
                              className="hidden-gem-bar-red"
                              style={{
                                left: `${currentTrack.track.level}%`,
                                width: `${100 - currentTrack.track.level}%`,
                              }}
                            ></div>
                          )}
                        </div>
                        <span className="level">
                          {currentTrack.track.level} %
                        </span>
                      </div>
                    )}

                    <h2 className="ms-4">Rating</h2>
                    {currentTrack && currentTrack !== "skit" && (
                      <div className="rating-skulls ms-4 mt-2">
                        {renderSkulls(currentTrack.track.rating)}
                        <span className="rating">
                          {currentTrack.track.rating}
                        </span>
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
              src={
                currentTrack === "skit" ? Skit : currentTrack.track.presignedUrl
              }
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
