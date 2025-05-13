import React, { useState, useEffect, useRef } from "react";
import "./Playlist.css";
import { Badge, Button } from "react-bootstrap";

const Playlist = () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [selectedTracks, setSelectedTracks] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [expandedPlaylists, setExpandedPlaylists] = useState([]);
  const [activePlayer, setActivePlayer] = useState(null);
  const audioRef = useRef(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    if (isBuilding) {
      fetchGenres();
      fetchAlbums();
    }
  }, [isBuilding]);

  useEffect(() => {
    fetchSavedPlaylists();
  }, []);

  const fetchSavedPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:3001/playlist");
      if (res.ok) {
        const data = await res.json();
        setSavedPlaylists(data);
      } else {
        console.error("Errore nel fetch delle playlist:", res.status);
      }
    } catch (error) {
      console.error("Errore nel fetch delle playlist:", error);
    }
  };

  useEffect(() => {
    if (activePlayer && audioRef.current) {
      audioRef.current.play();
    }
  }, [currentTrackIndex]);

  const fetchGenres = async () => {
    try {
      const response = await fetch("http://localhost:3001/genre");
      if (response.ok) {
        const data = await response.json();
        const sortedGenres = data.sort((a, b) => a.id - b.id);
        setGenres(sortedGenres);
      } else {
        console.error("Errore nel fetch dei generi:", response.status);
      }
    } catch (error) {
      console.error("Errore nel fetch dei generi:", error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await fetch("http://localhost:3001/album");
      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      } else {
        console.error("Errore nel fetch degli album:", response.status);
      }
    } catch (error) {
      console.error("Errore nel fetch degli album:", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value, artistQuery);
  };

  const handleArtistSearchChange = (e) => {
    const value = e.target.value;
    setArtistQuery(value);
    performSearch(searchQuery, value);
  };

  const performSearch = async (title, artist) => {
    if (!title.trim() && !artist.trim()) {
      setSearchResults([]);
      await fetchAlbums(); // torna alla lista completa
      return;
    }

    const params = new URLSearchParams();
    if (title.trim()) params.append("title", title);
    if (artist.trim()) params.append("artist", artist);

    try {
      const response = await fetch(
        `http://localhost:3001/album?${params.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      } else {
        console.error("Errore nella ricerca degli album:", response.status);
      }
    } catch (error) {
      console.error("Errore nella ricerca degli album:", error);
    }
  };

  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album);
  };

  const handleToggleTrack = (track) => {
    const alreadySelected = selectedTracks.find((t) => t.id === track.id);
    if (alreadySelected) {
      setSelectedTracks((prev) => prev.filter((t) => t.id !== track.id));
    } else {
      setSelectedTracks((prev) => [...prev, track]);
    }
  };

  const handleRemoveTrack = (trackId) => {
    setSelectedTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const getTotalDuration = () => {
    const totalSeconds = selectedTracks.reduce(
      (sum, track) => sum + (track.duration || 0),
      0
    );
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
  };

  const handleSavePlaylist = async () => {
    if (!playlistName.trim()) {
      alert("Inserisci un nome per la playlist!");
      return;
    }
    if (selectedTracks.length === 0) {
      alert("Aggiungi almeno una traccia!");
      return;
    }

    const payload = {
      name: playlistName,
      songIds: selectedTracks.map((t) => t.id),
    };

    try {
      const res = await fetch("http://localhost:3001/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedPlaylists((prev) => [...prev, data]);
        // Reset
        setIsBuilding(false);
        setPlaylistName("");
        setSelectedTracks([]);
        setSelectedAlbum(null);
        setSearchQuery("");
        setArtistQuery("");
        setSearchResults([]);
      } else {
        console.error("Errore salvataggio playlist:", res.status);
      }
    } catch (error) {
      console.error("Errore salvataggio playlist:", error);
    }
  };

  const togglePlaylist = (idx) => {
    setExpandedPlaylists(
      (prev) =>
        prev.includes(idx)
          ? prev.filter((i) => i !== idx) // chiudi se già aperta
          : [...prev, idx] // apri se chiusa
    );
  };

  const handleDeletePlaylist = async (playlistId) => {
    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare questa playlist?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:3001/playlist/${playlistId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSavedPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
        setExpandedPlaylists((prev) => prev.filter((i) => i !== playlistId));
      } else {
        console.error("Errore eliminazione playlist:", res.status);
      }
    } catch (error) {
      console.error("Errore eliminazione playlist:", error);
    }
  };

  const regeneratePresignedUrl = async (trackId) => {
    try {
      const response = await fetch(`http://localhost:3001/song/${trackId}`);
      if (response.ok) {
        const data = await response.json();
        return data.presignedUrl;
      } else {
        console.error("Errore nel fetch presigned URL:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Errore nel fetch presigned URL:", error);
      return null;
    }
  };

  const handlePlayPlaylist = (playlist) => {
    setCurrentTrackIndex(0);
    setActivePlayer(playlist);
  };

  return (
    <div className="playlist">
      {!isBuilding ? (
        <p className="add-playlist" onClick={() => setIsBuilding(true)}>
          + aggiungi nuova playlist
        </p>
      ) : (
        <div>
          {/* Input nome playlist */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Nome playlist..."
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </div>

          {/* Input ricerca titolo */}
          <div className="d-flex mb-3">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Cerca album per nome..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Input ricerca artista */}
          <div className="d-flex mb-3">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Cerca album per artista..."
              value={artistQuery}
              onChange={handleArtistSearchChange}
            />
          </div>

          {/* Risultati ricerca */}
          <div className="albums-container mb-4">
            {(searchQuery.trim() !== "" || artistQuery.trim() !== ""
              ? searchResults
              : albums
            ).map((album) => (
              <div
                key={album.id}
                className="album-box"
                onClick={() => handleSelectAlbum(album)}
              >
                📁 <div>{album.title}</div>
                <small className="text-muted">{album.artist}</small>
              </div>
            ))}
          </div>

          {/* Tracce dell'album selezionato */}
          {selectedAlbum && (
            <div className="mb-4">
              <h6>Tracce di: {selectedAlbum.title}</h6>
              {selectedAlbum.songs && selectedAlbum.songs.length > 0 ? (
                <ul className="list-group">
                  {selectedAlbum.songs.map((song) => (
                    <li
                      key={song.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={selectedTracks.some((t) => t.id === song.id)}
                          onChange={() => handleToggleTrack(song)}
                        />
                        🎵 {song.titolo}
                      </div>
                      <Badge bg="secondary">
                        {song.duration ? `${song.duration} sec` : "Durata N/A"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">Nessuna traccia disponibile.</p>
              )}
            </div>
          )}

          {/* Indice tracce selezionate */}
          {selectedTracks.length > 0 && (
            <div className="playlist-index mb-4">
              <h6>
                {playlistName || "Nome playlist"} - Durata: {getTotalDuration()}
              </h6>
              <ul className="list-group">
                {selectedTracks.map((track, index) => (
                  <li
                    key={track.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      {index + 1}. {track.titolo}
                    </div>
                    <div>
                      <span className="me-2">
                        {track.duration
                          ? `${track.duration} sec`
                          : "Durata N/A"}
                      </span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveTrack(track.id)}
                      >
                        ❌
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottone salva */}
          <Button variant="success" onClick={handleSavePlaylist}>
            Salva playlist
          </Button>
        </div>
      )}

      {savedPlaylists.length > 0 && (
        <div className="saved-playlists mt-4">
          <h5>Playlist salvate:</h5>
          {savedPlaylists.map((playlist) => (
            <div key={playlist.id} className="saved-playlist">
              <div className="d-flex justify-content-between align-items-center">
                <div
                  onClick={() => togglePlaylist(playlist.id)}
                  style={{ flex: 1, cursor: "pointer" }}
                >
                  <h6 className="mb-0">{playlist.name}</h6>
                </div>

                <div className="d-flex align-items-center">
                  <span
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={() => handlePlayPlaylist(playlist)}
                  >
                    ▶️ Play
                  </span>
                  <p className="mb-0">Durata: {playlist.totalDuration}</p>
                </div>
              </div>

              {expandedPlaylists.includes(playlist.id) && (
                <div className="mt-2">
                  <ul className="list-group mb-2">
                    {Array.isArray(playlist.tracks) &&
                      playlist.tracks.map((track, index) => (
                        <li
                          key={track.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {index + 1}. {track.titolo}
                          <Badge bg="secondary">
                            {track.duration ? `${track.duration} sec` : "N/A"}
                          </Badge>
                        </li>
                      ))}
                  </ul>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePlaylist(playlist.id)}
                  >
                    🗑️ Elimina playlist
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Modal per il player audio */}
      {activePlayer && (
        <div className="playlist-modal-overlay">
          <div className="playlist-modal">
            <h5>{activePlayer.name}</h5>
            <p>Durata: {activePlayer.totalDuration}</p>

            <div className="tracks-columns mb-3">
              {Array.isArray(activePlayer.tracks) &&
                Array.from({
                  length: Math.ceil(activePlayer.tracks.length / 5),
                }).map((_, colIndex) => (
                  <div key={colIndex} className="tracks-column">
                    {activePlayer.tracks
                      .slice(colIndex * 5, colIndex * 5 + 5)
                      .map((track, index) => {
                        const globalIndex = colIndex * 5 + index;
                        return (
                          <div
                            key={track.id}
                            className={`track-box ${
                              globalIndex === currentTrackIndex ? "active" : ""
                            }`}
                          >
                            <div className="track-title">
                              {globalIndex + 1}. {track.titolo}
                            </div>
                            <div className="track-duration">
                              {track.duration ? `${track.duration} sec` : "N/A"}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
            </div>

            <div className="d-flex justify-content-center mb-3">
              <Button
                variant="primary"
                className="me-2"
                onClick={() => audioRef.current.play()}
              >
                ▶️ Play
              </Button>
              <Button
                variant="secondary"
                onClick={() => audioRef.current.pause()}
              >
                ⏸️ Pause
              </Button>
            </div>

            <Button
              variant="danger"
              onClick={() => {
                audioRef.current.pause();
                setActivePlayer(null);
              }}
            >
              Chiudi
            </Button>

            {/* Audio player */}
            <audio
              ref={audioRef}
              src={activePlayer.tracks[currentTrackIndex]?.presignedUrl}
              onEnded={() => {
                if (currentTrackIndex < activePlayer.tracks.length - 1) {
                  setCurrentTrackIndex((prev) => prev + 1);
                } else {
                  // quando arriva all'ultima traccia puoi stoppare (opzionale)
                  console.log("Playlist finita");
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlist;
