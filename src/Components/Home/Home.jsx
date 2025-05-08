import React, { useEffect, useRef, useState } from "react";
import "./Home.css";
import { Col, Container, Row } from "react-bootstrap";
import Homeimg from "../../Assets/Img/home.png";
import Homeimg2 from "../../Assets/Img/home2.png";

const Home = () => {
  console.log("🚀 Home component montato"); // 👈 METTI QUESTO
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistIndex, setSelectedPlaylistIndex] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [albumInfo, setAlbumInfo] = useState(null);

  const audioRef = useRef(null);

  // Carica le playlist dal localStorage
  useEffect(() => {
    const saved = localStorage.getItem("playlists");
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("📂 Playlist caricate dal localStorage:", parsed); // 👈 AGGIUNGI QUESTO
      setPlaylists(parsed);
    }
  }, []);

  // Carica le info dell'album quando selezioni una playlist o cambi traccia
  useEffect(() => {
    const track = getCurrentTrack();
    if (track && track.albumId) {
      fetchAlbum(track.albumId);
    }
  }, [selectedPlaylistIndex, currentTrackIndex]);

  // Riproduce automaticamente la traccia quando currentTrackIndex cambia
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      console.log("▶️ Auto-play della nuova traccia...");
      console.log("🎯 URL attuale:", currentTrack.presignedUrl);
      audioRef.current.play().catch((err) => {
        console.warn("⚠️ Problema nell'auto-play:", err);
      });
    }
  }, [currentTrackIndex, playlists]);

  const fetchTrackFresh = async (track) => {
    try {
      const response = await fetch(`http://localhost:3001/song/${track.id}`);
      if (response.ok) {
        const data = await response.json();
        return {
          ...track, // 👈 mantiene albumId, id ecc.
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
    setCurrentTrackIndex(0); // resetta alla prima traccia
  };

  const handlePlay = async () => {
    if (selectedPlaylistIndex === null) return;

    const selectedPlaylist = playlists[selectedPlaylistIndex];

    const freshTracks = await Promise.all(
      selectedPlaylist.tracks.map((track) => fetchTrackFresh(track))
    );

    // aggiorna la playlist selezionata con i track aggiornati
    const updatedPlaylists = [...playlists];
    updatedPlaylists[selectedPlaylistIndex] = {
      ...selectedPlaylist,
      tracks: freshTracks,
    };

    // aggiorna React state e localStorage
    setPlaylists(updatedPlaylists);
    localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));

    // ✅ Forza la riproduzione della prima traccia aggiornata
    setCurrentTrackIndex(0);
  };

  const getCurrentTrack = () => {
    if (
      selectedPlaylistIndex !== null &&
      playlists[selectedPlaylistIndex] &&
      playlists[selectedPlaylistIndex].tracks[currentTrackIndex]
    ) {
      return playlists[selectedPlaylistIndex].tracks[currentTrackIndex];
    }
    return null;
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

  const currentTrack = getCurrentTrack();
  console.log("🎵 currentTrack:", currentTrack);

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

  // Trova le tracce precedente e successiva
  const previousTrack =
    selectedPlaylistIndex !== null &&
    currentTrackIndex > 0 &&
    playlists[selectedPlaylistIndex].tracks[currentTrackIndex - 1];

  const nextTrack =
    selectedPlaylistIndex !== null &&
    currentTrackIndex < playlists[selectedPlaylistIndex].tracks.length - 1 &&
    playlists[selectedPlaylistIndex].tracks[currentTrackIndex + 1];

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
                  <h2 className="ms-4">Hidden Gem Level</h2>
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
                  <div className="m-3">
                    <h5 className="text-center">Prev</h5>
                    <h4>{previousTrack.titolo}</h4>
                  </div>
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
                  <div className="m-3">
                    <h5 className="text-center">Next</h5>
                    <h4>{nextTrack.titolo}</h4>
                  </div>
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
            <div className="playlist-home">
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

        {/* Audio player */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.presignedUrl}
            onEnded={() => {
              if (
                selectedPlaylistIndex !== null &&
                currentTrackIndex <
                  playlists[selectedPlaylistIndex].tracks.length - 1
              ) {
                setCurrentTrackIndex((prev) => prev + 1);
              } else {
                console.log("Playlist finita");
              }
            }}
          />
        )}
      </Container>
    </>
  );
};

export default Home;
