import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import { Button, Col, Container, Row } from "react-bootstrap";
import Homeimg from "../../Assets/Img/home.png";
import Homeimg2 from "../../Assets/Img/home2.png";
import { Link, Navigate } from "react-router-dom";
import ReactHowler from "react-howler";

const Home = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  console.log("🚀 Home component montato"); // 👈 METTI QUESTO
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(null);

  const playerRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const stopTimerRef = useRef(null);

  // NUOVO STATO
  const [currentTrack, setCurrentTrack] = useState(null);

  // Playlist attiva e tracce prev/next
  const currentPlaylist =
    selectedPlaylistIndex !== null ? playlists[selectedPlaylistIndex] : null;

  const currentIdx = currentPlaylist?.tracks.findIndex(
    (t) => t.id === currentTrack?.id
  );

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

  // Carica le playlist dal localStorage
  useEffect(() => {
    const saved = localStorage.getItem("playlists");
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("📂 Playlist caricate dal localStorage:", parsed); // 👈 AGGIUNGI QUESTO
      setPlaylists(parsed);
    }
  }, []);

  useEffect(() => {
    if (currentTrack && currentTrack.albumId) {
      fetchAlbum(currentTrack.albumId);
    }
  }, [currentTrack]);
  useEffect(() => {
    return () => {
      clearTimeout(fadeTimerRef.current);
      clearTimeout(stopTimerRef.current);
    };
  }, [currentTrack]);

  const fetchTrackFresh = async (track) => {
    try {
      const response = await fetch(`http://localhost:3001/song/${track.id}`);
      if (response.ok) {
        const data = await response.json();
        return {
          ...track,
          titolo: data.titolo,
          bucketName: data.bucketName,
          fileName: data.fileName,
          duration: data.duration,
          rating: data.rating,
          level: data.level,
          presignedUrl: data.presignedUrl,
        };
      } else {
        console.error("Errore nel fetch traccia:", response.status);
        return track; // fallback se errore
      }
    } catch (error) {
      console.error("Errore nel fetch traccia:", error);
      return track; // fallback
    }
  };

  const handleSelectPlaylist = (idx) => {
    console.log("✅ Playlist selezionata:", playlists[idx]); // 👈 AGGIUNGI QUESTO
    setSelectedPlaylistIndex(idx);
  };

  const handlePlay = async () => {
    if (selectedPlaylistIndex === null) return;

    const selectedPlaylist = playlists[selectedPlaylistIndex];

    const freshTracks = await Promise.all(
      selectedPlaylist.tracks.map((track) => fetchTrackFresh(track))
    );

    const updatedPlaylists = [...playlists];
    updatedPlaylists[selectedPlaylistIndex] = {
      ...selectedPlaylist,
      tracks: freshTracks,
    };
    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));

    const firstTrack = freshTracks[0];
    console.log("🎵 Avvio prima traccia:", firstTrack.titolo);
    setCurrentTrack(firstTrack);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    if (!selectedPlaylistIndex) return;
    const currentPlaylist = playlists[selectedPlaylistIndex];
    if (!currentTrack || !currentPlaylist) return;

    const currentIdx = currentPlaylist.tracks.findIndex(
      (t) => t.id === currentTrack.id
    );

    const nextTrack = currentPlaylist.tracks[currentIdx + 1];
    if (nextTrack) {
      console.log("➡️ Passo alla traccia successiva:", nextTrack.titolo);
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
    } else {
      console.log("✅ Playlist finita");
      setIsPlaying(false);
    }
  };

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
      <Container fluid className="home-container">
        <Row>
          <Col xs={12}>
            <div className="card-home position-relative">
              <img className="first" src={Homeimg} alt="" />
              <img src={Homeimg2} className="second" alt="" />
              {/* SEZIONE INFO */}
              <div className="info position-absolute d-flex flex-column justify-content-between ">
                <div className="mt-4">
                  <h1 className="text-center">
                    {currentTrack ? currentTrack.titolo : "Titolo"}
                  </h1>
                  <h2 className="text-center data">
                    {albumInfo ? albumInfo.date : "Data"}
                  </h2>

                  <h3 className="ms-5 mt-5">
                    <span>Artist:</span>
                    {albumInfo ? albumInfo.artist : "Artista"}
                  </h3>
                  <h3 className="ms-5 mt-4">
                    <span>Album:</span> {albumInfo ? albumInfo.title : "Album"}
                  </h3>
                </div>
                <div className="mb-4 bar-wrapper">
                  <h2 className="ms-4">Hidden Gem Lvl</h2>
                  {/* Barra Hidden Gem */}
                  {currentTrack && (
                    <div className="d-flex align-items-center ms-4 mt-2 mb-5">
                      <div className="hidden-gem-bar-wrapper me-3">
                        <div
                          className="hidden-gem-bar-fill"
                          style={{
                            width: `${currentTrack.level}%`,
                          }}
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
                      <span>{currentTrack.level} %</span>
                    </div>
                  )}

                  <h2 className="ms-4">Rating</h2>
                  {/* Stelle Rating */}
                  {currentTrack && (
                    <div className="rating-skulls ms-4 mt-2">
                      {renderSkulls(currentTrack.rating)}{" "}
                      <span>
                        {currentTrack ? currentTrack.rating : "Rating"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* SEZIONE TRACK INDEX */}
              <div className="track-index position-absolute d-flex justify-content-between gap-5 align-items-center">
                {/* Previous track */}
                {previousTrack ? (
                  <h4 className="ms-4">
                    <span>Prev</span>
                    {previousTrack.titolo}
                  </h4>
                ) : (
                  <h4></h4> // vuoto se non esiste
                )}

                {/* Animazione */}
                <div className="song-animation d-flex align-items-end">
                  {[...Array(13)].map((_, idx) => (
                    <div key={idx} className="bar"></div>
                  ))}
                </div>

                {/* Next track */}
                {nextTrack ? (
                  <h4 className="me-4">
                    <span>Next</span>
                    {nextTrack.titolo}
                  </h4>
                ) : (
                  <h4></h4> // vuoto se non esiste
                )}
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          {/* SEZIONE PLAYLIST */}
          <Col xs={12}>
            <div className="playlist-home border border-2">
              <h5>Playlist disponibili</h5>
              {playlists.map((playlist, idx) => (
                <div key={idx} className="d-flex align-items-center mb-2">
                  <input
                    type="radio"
                    name="selectedPlaylist"
                    value={idx}
                    checked={selectedPlaylistIndex === idx}
                    onChange={() => handleSelectPlaylist(idx)}
                  />
                  <span className="ms-2">
                    {playlist.name} ({playlist.totalDuration})
                  </span>
                </div>
              ))}

              {selectedPlaylistIndex !== null && (
                <button className="btn btn-primary mt-3" onClick={handlePlay}>
                  ▶️ Play
                </button>
              )}
            </div>
          </Col>
        </Row>
        <Link to="/control">
          <Button>Control Page</Button>
        </Link>

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
    </>
  );
};

export default Home;
