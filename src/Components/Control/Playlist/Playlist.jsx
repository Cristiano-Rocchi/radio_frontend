// ==============================
// ✅ INDICE
// 1. Import
// 2. Stato e riferimenti
//   2.1 Stato UI
//   2.2 Stato dati
//   2.3 Stato audio
//   2.4 Stato drag & drop
// 3. Effetti React
//   3.1 Caricamento generi e album
//   3.2 Caricamento iniziale playlist
//   3.3 Autoplay traccia attiva
//   3.4 Chiudi modale se lista è vuota
// 4. Funzioni fetch
//   4.1 Fetch playlist
//   4.2 Fetch generi
//   4.3 Fetch album
// 5. Ricerca
//   5.1 Ricerca per titolo/album
//   5.2 Ricerca per artista
//   5.3 Ricerca canzoni per titolo
// 6. Selezione tracce
//   6.1 Toggle selezione traccia
//   6.2 Rimuovi traccia dalla selezione
// 7. Gestione playlist
//   7.1 Calcola durata totale
//   7.2 Salva nuova playlist
//   7.3 Espandi playlist
//   7.4 Elimina playlist
//   7.5 Regenerazione Presigned URL
//   7.6 Riproduci playlist
// 8. Modifica tracce (inline)
//   8.1 Gestione stato edit
//   8.2 Salvataggio modifiche
// 9. Render
// ==============================

// 1. Import
import React, { useState, useEffect, useRef } from "react";
import "./Playlist.css";
import { Badge, Button, Col, Container, Row } from "react-bootstrap";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { useContext } from "react";
import { SettingsContext } from "../../Settings/SettingsContext";

// 2. Stato e riferimenti
const Playlist = () => {
  // 2.1 Stato UI
  const [isBuilding, setIsBuilding] = useState(false);
  const [playlistName, setPlaylistName] = useState("");

  // 2.2 Stato dati
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [songQuery, setSongQuery] = useState("");
  const [editingSongs, setEditingSongs] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [expandedAlbumId, setExpandedAlbumId] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const [selectedTracks, setSelectedTracks] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [expandedPlaylists, setExpandedPlaylists] = useState([]);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const [editedName, setEditedName] = useState("");

  // 2.3 Stato audio
  const [activePlayer, setActivePlayer] = useState(null);
  const audioRef = useRef(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // 2.4 Stato drag & drop
  const sensors = useSensors(useSensor(PointerSensor));
  const [reorderMode, setReorderMode] = useState({});

  //2.5 Stao Modalità Notte
  const { darkMode } = useContext(SettingsContext);

  // 3. Effetti React
  useEffect(() => {
    if (isBuilding) {
      fetchGenres();
      fetchAlbums();
    }
  }, [isBuilding]);

  // 3.1 Caricamento iniziale playlist
  useEffect(() => {
    fetchSavedPlaylists();
  }, []);

  // 4. Funzioni fetch
  const fetchSavedPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:3001/playlist");
      if (res.ok) {
        const data = await res.json();

        // Pre-elabora i dati per colonna 2
        const playlistsWithExtras = data.map((pl) => ({
          ...pl,
          tracks: pl.tracks.map((track) => ({
            ...track,
            artist: track.artist || "-", // fallback
            albumTitle: track.albumTitle || "-", // fallback
          })),
        }));

        setSavedPlaylists(playlistsWithExtras);
      } else {
        console.error("Errore nel fetch delle playlist:", res.status);
      }
    } catch (error) {
      console.error("Errore nel fetch delle playlist:", error);
    }
    setExpandedPlaylists([]);
  };

  // 3.2 Autoplay traccia attiva
  useEffect(() => {
    if (activePlayer && audioRef.current) {
      audioRef.current.play();
    }
  }, [currentTrackIndex]);

  // 3.3 Chiudi modale se lista è vuota
  useEffect(() => {
    if (selectedTracks.length === 0) {
      setShowTrackModal(false);
    }
  }, [selectedTracks]);

  // 4.2 Fetch generi
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

  // 4.3 Fetch album
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

  // 5. Ricerca

  // 5.1 Ricerca per titolo/album
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value, artistQuery);
  };

  // 5.2 Ricerca per artista
  const handleArtistSearchChange = (e) => {
    const value = e.target.value;
    setArtistQuery(value);
    performSearch(searchQuery, value);
  };

  const performSearch = async (title, artist) => {
    setExpandedAlbumId(null);
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

  // 6. Selezione tracce

  // 6.1 Toggle selezione traccia
  const handleToggleTrack = (track) => {
    const alreadySelected = selectedTracks.find((t) => t.id === track.id);
    let updatedTracks;
    if (alreadySelected) {
      updatedTracks = selectedTracks.filter((t) => t.id !== track.id);
    } else {
      updatedTracks = [...selectedTracks, track];
    }

    setSelectedTracks(updatedTracks);
    setShowTrackModal(updatedTracks.length > 0); // mostra se c'è almeno una traccia
  };

  // 6.2 Rimuovi traccia dalla selezione
  const handleRemoveTrack = (trackId) => {
    setSelectedTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // 5.3 Ricerca canzoni per titolo
  const searchSongsByTitle = async (title) => {
    setExpandedAlbumId(null);
    if (!title.trim()) {
      setSelectedAlbum(null); // se il campo è vuoto, puliamo la lista
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3001/song/search?title=${encodeURIComponent(title)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSelectedAlbum({
          title: `Risultati per "${title}"`,
          songs: data,
        });
      } else {
        console.error("Errore nella ricerca delle canzoni:", res.status);
      }
    } catch (error) {
      console.error("Errore nella ricerca delle canzoni:", error);
    }
  };

  // 7. Gestione playlist
  const getTotalDuration = () => {
    const totalSeconds = selectedTracks.reduce(
      (sum, track) => sum + (track.duration || 0),
      0
    );
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
  };

  const getPlaylistDuration = (tracks) => {
    const total = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${min} min ${sec} sec`;
  };

  // 7.2 Salva nuova playlist
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
        setSongQuery("");
        setSearchResults([]);
        setShowTrackModal(false);
      } else {
        console.error("Errore salvataggio playlist:", res.status);
      }
    } catch (error) {
      console.error("Errore salvataggio playlist:", error);
    }
  };

  // 7.3 Espandi playlist
  const togglePlaylist = (id) => {
    setExpandedPlaylists((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [id]
    );
  };

  // 7.4 Elimina playlist
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

  //7.5 Modifica Nome Playlist

  const startEditingName = (playlist) => {
    setEditingPlaylistId(playlist.id);
    setEditedName(playlist.name);
  };

  const saveEditedName = async (playlistId) => {
    try {
      const res = await fetch(`http://localhost:3001/playlist/${playlistId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedName }),
      });

      if (res.ok) {
        // aggiorna localmente
        setSavedPlaylists((prev) =>
          prev.map((p) =>
            p.id === playlistId ? { ...p, name: editedName } : p
          )
        );
        setEditingPlaylistId(null);
      } else {
        console.error("Errore salvataggio nome playlist:", res.status);
      }
    } catch (error) {
      console.error("Errore salvataggio nome playlist:", error);
    }
  };

  // 7.6 Regenerazione Presigned URL
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

  // 7.7 Riproduci playlist
  const handlePlayPlaylist = (playlist) => {
    setCurrentTrackIndex(0);
    setActivePlayer(playlist);
  };

  // 8. Modifica tracce (inline)
  const renderTrackRow = (track, index, playlist) => {
    // 8.1 Gestione stato edit
    const isEditing = editingSongs[track.id]?.isEditing || false;
    const editedTitle = editingSongs[track.id]?.editedTitle ?? track.titolo;
    const editedRating =
      editingSongs[track.id]?.editedRating ?? track.rating ?? 0;
    const editedLevel = editingSongs[track.id]?.editedLevel ?? track.level ?? 0;

    const handleInputChange = (field, value) => {
      setEditingSongs((prev) => ({
        ...prev,
        [track.id]: {
          ...prev[track.id],
          [field]: value,
        },
      }));
    };

    // 8.2 Salvataggio modifiche
    const handleEditClick = async () => {
      if (isEditing) {
        const body = {
          titolo: editedTitle,
          rating: parseInt(editedRating),
          level: parseInt(editedLevel),
        };
        const res = await fetch(`http://localhost:3001/song/${track.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          setSavedPlaylists((prev) =>
            prev.map((pl) =>
              pl.id === playlist.id
                ? {
                    ...pl,
                    tracks: pl.tracks.map((t) =>
                      t.id === track.id ? { ...t, ...body } : t
                    ),
                  }
                : pl
            )
          );
          setEditingSongs((prev) => ({
            ...prev,
            [track.id]: { ...prev[track.id], isEditing: false },
          }));
        }
      } else {
        setEditingSongs((prev) => ({
          ...prev,
          [track.id]: {
            isEditing: true,
            editedTitle: track.titolo,
            editedRating: track.rating,
            editedLevel: track.level,
          },
        }));
      }
    };

    // 9. Render
    return (
      <>
        <td>{index + 1}</td>
        <td>
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => handleInputChange("editedTitle", e.target.value)}
              className="form-control form-control-sm"
            />
          ) : (
            track.titolo
          )}
        </td>
        <td>{track.albumArtist || "-"}</td>
        <td>{track.albumTitle || "-"}</td>
        <td>
          {isEditing ? (
            <input
              type="number"
              value={editedRating}
              min="0"
              max="10"
              className="form-control form-control-sm"
              onChange={(e) =>
                handleInputChange("editedRating", e.target.value)
              }
            />
          ) : (
            track.rating
          )}
        </td>
        <td>
          {isEditing ? (
            <input
              type="number"
              value={editedLevel}
              min="0"
              max="100"
              className="form-control form-control-sm"
              onChange={(e) => handleInputChange("editedLevel", e.target.value)}
            />
          ) : (
            track.level
          )}
        </td>
        <td>{track.duration}</td>
        <td className="d-flex gap-2">
          <Button
            variant={isEditing ? "success" : "outline-primary"}
            size="sm"
            onClick={handleEditClick}
          >
            {isEditing ? "Salva" : "Modifica"}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => {
              const confirm = window.confirm(
                "Vuoi rimuovere questa traccia dalla playlist?"
              );
              if (!confirm) return;

              const updatedTracks = playlist.tracks.filter(
                (t) => t.id !== track.id
              );

              setSavedPlaylists((prev) =>
                prev.map((pl) =>
                  pl.id === playlist.id ? { ...pl, tracks: updatedTracks } : pl
                )
              );

              fetch(
                `http://localhost:3001/playlist/${playlist.id}/song/${track.id}`,
                {
                  method: "DELETE",
                }
              );
            }}
          >
            ❌
          </Button>
        </td>
      </>
    );
  };

  return (
    <div className={`playlist ${darkMode ? "dark-mode" : ""}`}>
      <Container fluid>
        <Row>
          {/* -------------Colonna 1: Playlist salvate--------------- */}
          <Col xs={3} className="playlist-column-left">
            <h5 className="text-center">Playlist Salvate</h5>
            <p
              className="add-playlist text-primary"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setIsBuilding(true);
                setSelectedTracks([]);
                setSelectedAlbum(null);
              }}
            >
              + Aggiungi nuova playlist
            </p>
            {savedPlaylists.map((playlist) => (
              <div key={playlist.id} className="d-flex align-items-center mb-2">
                <input
                  type="radio"
                  name="selectedPlaylist"
                  checked={expandedPlaylists.includes(playlist.id)}
                  onChange={() => togglePlaylist(playlist.id)}
                />
                <span className="ms-2">{playlist.name}</span>
              </div>
            ))}
          </Col>

          {/* -----------Colonna 2: Tracce della playlist----------------- */}
          <Col xs={6} className="playlist-column-center">
            {expandedPlaylists.length > 0 &&
              savedPlaylists
                .filter((pl) => expandedPlaylists.includes(pl.id))
                .map((playlist) => (
                  <div key={playlist.id} className="saved-playlist">
                    <div className="mb-2 d-flex align-items-center gap-3">
                      {editingPlaylistId === playlist.id ? (
                        <>
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="form-control form-control-sm me-2"
                            style={{ width: "200px" }}
                          />
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => saveEditedName(playlist.id)}
                          >
                            OK
                          </button>
                        </>
                      ) : (
                        <>
                          <h5 className="mb-0 me-2">{playlist.name}</h5>
                          <button
                            className="btn btn-outline-secondary border-0 btn-sm"
                            onClick={() => startEditingName(playlist)}
                          >
                            ✏️
                          </button>
                        </>
                      )}
                    </div>
                    <h5 className="fs-6">
                      {" "}
                      Durata: {getPlaylistDuration(playlist.tracks)}
                    </h5>

                    <div className="d-flex justify-content-start mb-2 mt-3 gap-3">
                      <Button
                        variant={
                          reorderMode[playlist.id]
                            ? "success"
                            : "outline-secondary"
                        }
                        size="sm"
                        onClick={() => {
                          if (reorderMode[playlist.id]) {
                            // Salva ordine
                            const updated = savedPlaylists.find(
                              (pl) => pl.id === playlist.id
                            );
                            fetch(
                              `http://localhost:3001/playlist/${playlist.id}/order`,
                              {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(
                                  updated.tracks.map((t) => t.id)
                                ),
                              }
                            );
                          }

                          setReorderMode((prev) => ({
                            ...prev,
                            [playlist.id]: !prev[playlist.id],
                          }));
                        }}
                      >
                        {reorderMode[playlist.id]
                          ? "💾 Salva ordine"
                          : "📝 Modifica ordine"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeletePlaylist(playlist.id)}
                      >
                        🗑️ Elimina playlist
                      </Button>
                    </div>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nome</th>
                          <th>Artista</th>
                          <th>Album</th>
                          <th>Rating</th>
                          <th>Level</th>
                          <th>Durata</th>
                          <th>Edit</th>
                        </tr>
                      </thead>
                      {reorderMode[playlist.id] ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => {
                            const { active, over } = event;
                            if (!over || active.id === over.id) return;

                            const oldIndex = playlist.tracks.findIndex(
                              (t) => t.id === active.id
                            );
                            const newIndex = playlist.tracks.findIndex(
                              (t) => t.id === over.id
                            );
                            const reordered = arrayMove(
                              playlist.tracks,
                              oldIndex,
                              newIndex
                            );

                            setSavedPlaylists((prev) =>
                              prev.map((pl) =>
                                pl.id === playlist.id
                                  ? { ...pl, tracks: reordered }
                                  : pl
                              )
                            );
                          }}
                        >
                          <SortableContext
                            items={playlist.tracks.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <tbody>
                              {playlist.tracks.map((track, index) => (
                                <SortableRow key={track.id} id={track.id}>
                                  {renderTrackRow(track, index, playlist)}
                                </SortableRow>
                              ))}
                            </tbody>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <tbody>
                          {playlist.tracks.map((track, index) => (
                            <tr key={track.id}>
                              {renderTrackRow(track, index, playlist)}
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>
                ))}
          </Col>

          {/* Colonna 3: Builder nuova playlist */}
          <Col xs={3} className="playlist-column-right">
            {isBuilding && (
              <div>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Cerca per canzone..."
                  value={songQuery}
                  onChange={(e) => {
                    setSongQuery(e.target.value);
                    searchSongsByTitle(e.target.value);
                  }}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Cerca per artista..."
                  value={artistQuery}
                  onChange={handleArtistSearchChange}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Cerca per album..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />

                <div className="albums-container mb-3">
                  {(searchQuery.trim() !== "" || artistQuery.trim() !== "") && (
                    <div className="albums-container mb-3">
                      {searchResults.map((album) => (
                        <div key={album.id} className="mb-2">
                          <div
                            className="album-box"
                            onClick={() => {
                              setExpandedAlbumId((prev) =>
                                prev === album.id ? null : album.id
                              );
                              setSelectedAlbum(album);
                            }}
                            style={{
                              cursor: "pointer",
                              border: "1px solid #ccc",
                              padding: "5px",
                            }}
                          >
                            📁 {album.title} <small>({album.artist})</small>
                          </div>

                          {expandedAlbumId === album.id &&
                            album.songs &&
                            album.songs.length > 0 && (
                              <ul className="list-group mt-2">
                                {album.songs.map((song) => (
                                  <li
                                    key={song.id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                  >
                                    <div>
                                      <input
                                        type="checkbox"
                                        className="form-check-input me-2"
                                        checked={selectedTracks.some(
                                          (t) => t.id === song.id
                                        )}
                                        onChange={() => handleToggleTrack(song)}
                                      />
                                      🎵 {song.titolo}
                                    </div>
                                    <Badge bg="secondary">
                                      {song.duration
                                        ? `${song.duration} sec`
                                        : "N/A"}
                                    </Badge>
                                  </li>
                                ))}
                              </ul>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {songQuery.trim() !== "" &&
                  selectedAlbum &&
                  selectedAlbum.songs &&
                  selectedAlbum.songs.length > 0 && (
                    <ul className="list-group mb-3">
                      {selectedAlbum.songs.map((song) => (
                        <li
                          key={song.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={selectedTracks.some(
                                (t) => t.id === song.id
                              )}
                              onChange={() => handleToggleTrack(song)}
                            />
                            🎵 {song.titolo}
                          </div>
                          <Badge bg="secondary">
                            {song.duration ? `${song.duration} sec` : "N/A"}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            )}
          </Col>
        </Row>
      </Container>
      {showTrackModal && (
        <div className="track-modal">
          <h5>Tracce selezionate</h5>
          <p>
            <strong>Durata:</strong> {getTotalDuration()}
          </p>
          <ul className="list-group mb-3">
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
                    {track.duration ? `${track.duration} sec` : "N/A"}
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

          <label className="form-label">Nome playlist:</label>
          <input
            type="text"
            className="form-control mb-2"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />

          <Button
            variant="success"
            className="w-100"
            onClick={handleSavePlaylist}
          >
            Salva
          </Button>
          <Button
            variant="outline-secondary"
            className="w-100 mt-2"
            onClick={() => {
              const confirm = window.confirm(
                "Vuoi annullare la creazione della playlist?"
              );
              if (confirm) {
                setSelectedTracks([]);
                setPlaylistName("");
                setSelectedAlbum(null);
                setShowTrackModal(false);
                setSongQuery("");
                setSearchQuery("");
                setArtistQuery("");
              }
            }}
          >
            Annulla
          </Button>
        </div>
      )}
    </div>
  );
};
const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
};

export default Playlist;
