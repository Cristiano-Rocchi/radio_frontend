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
    if (audioRef.current) {
      console.log("▶️ Auto-play della nuova traccia...");
      audioRef.current.play().catch((err) => {
        console.warn("⚠️ Problema nell'auto-play:", err);
      });
    }
  }, [currentTrackIndex]);

  const handleSelectPlaylist = (idx) => {
    console.log("✅ Playlist selezionata:", playlists[idx]); // 👈 AGGIUNGI QUESTO
    setSelectedPlaylistIndex(idx);
    setCurrentTrackIndex(0); // resetta alla prima traccia
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
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

  return (
    <>
      <Container fluid className="home-container">
        <Row>
          <Col xs={12}>
            <div className="card-home position-relative">
              <img className="first" src={Homeimg} alt="" />
              <img src={Homeimg2} className="second" alt="" />
              <div className="info position-absolute d-flex flex-column justify-content-between ">
                <div className="mt-4">
                  <h1 className="text-center ">
                    {currentTrack ? currentTrack.titolo : "Titolo"}
                  </h1>
                  <h2 className="ms-4 mt-4">
                    {albumInfo ? albumInfo.date : "Data"}
                  </h2>
                  <h2 className="ms-4">
                    {albumInfo ? albumInfo.artist : "Artista"}
                  </h2>
                </div>
                <div className="mb-4">
                  <h3 className="ms-2">
                    Album: {albumInfo ? albumInfo.title : "Album"}
                  </h3>
                  <h3 className="ms-2">
                    Rating: {currentTrack ? currentTrack.rating : "Rating"}
                  </h3>
                  <h3 className="ms-2">
                    Hidden Gem: {currentTrack ? currentTrack.level : "⭐"}
                  </h3>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
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
