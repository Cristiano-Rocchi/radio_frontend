import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (isBuilding) {
      fetchGenres();
      fetchAlbums();
    }
  }, [isBuilding]);

  useEffect(() => {
    const saved = localStorage.getItem("playlists");
    if (saved) {
      setSavedPlaylists(JSON.parse(saved));
    }
  }, []);

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

  const handleSavePlaylist = () => {
    if (!playlistName.trim()) {
      alert("Inserisci un nome per la playlist!");
      return;
    }
    if (selectedTracks.length === 0) {
      alert("Aggiungi almeno una traccia alla playlist!");
      return;
    }
    const playlistData = {
      name: playlistName,
      totalDuration: getTotalDuration(),
      tracks: selectedTracks,
    };

    console.log("✅ Playlist salvata:", playlistData);

    // Aggiunge la nuova playlist alla lista e salva in localStorage
    setSavedPlaylists((prev) => {
      const updated = [...prev, playlistData];
      localStorage.setItem("playlists", JSON.stringify(updated)); // salva anche in localStorage
      return updated;
    });

    // Reset
    setIsBuilding(false);
    setPlaylistName("");
    setSelectedTracks([]);
    setSelectedAlbum(null);
    setSearchQuery("");
    setArtistQuery("");
    setSearchResults([]);
  };

  const togglePlaylist = (idx) => {
    setExpandedPlaylists(
      (prev) =>
        prev.includes(idx)
          ? prev.filter((i) => i !== idx) // chiudi se già aperta
          : [...prev, idx] // apri se chiusa
    );
  };

  const handleDeletePlaylist = (idx) => {
    const confirmDelete = window.confirm(
      "Sei sicuro di voler eliminare questa playlist?"
    );
    if (!confirmDelete) return;

    setSavedPlaylists((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      localStorage.setItem("playlists", JSON.stringify(updated)); // aggiorna localStorage
      return updated;
    });
    setExpandedPlaylists((prev) => prev.filter((i) => i !== idx)); // chiude se era aperta
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
          {savedPlaylists.map((playlist, idx) => (
            <div
              key={idx}
              className="saved-playlist mb-3 p-2 border rounded"
              style={{ cursor: "pointer" }}
            >
              <div
                className="d-flex justify-content-between align-items-center"
                onClick={() => togglePlaylist(idx)}
              >
                <h6 className="mb-0">{playlist.name}</h6>
                <p className="mb-0">Durata: {playlist.totalDuration}</p>
              </div>

              {expandedPlaylists.includes(idx) && (
                <div className="mt-2">
                  <ul className="list-group mb-2">
                    {playlist.tracks.map((track, index) => (
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
                    onClick={() => handleDeletePlaylist(idx)}
                  >
                    🗑️ Elimina playlist
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlist;
