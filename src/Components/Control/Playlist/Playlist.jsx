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
//   9.1 Colonna 1: Playlist salvate
//   9.2 Colonna 2: Tracce della playlist
//   9.3 Colonna 3: Builder nuova playlist
// 10. Modali
//   10.1 Modale per tracce selezionate
//   10.2 Modale per aggiungere tracce
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
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import TrackSelectionModal from "./Modal/TrackSelectionModal";
import AddTrackModal from "./Modal/AddTrackModal";
import PlaylistCol1 from "./Column/PlaylistCol1";
import PlaylistCol2 from "./Column/PlaylistCol2";
import PlaylistCol3 from "./Column/PlaylistCol3";

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

  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [trackSearchQuery, setTrackSearchQuery] = useState("");
  const [trackSearchResults, setTrackSearchResults] = useState([]);
  const [tracksToAdd, setTracksToAdd] = useState([]);
  const [playlistBeingEdited, setPlaylistBeingEdited] = useState(null);

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

    // 9. ---------Render-------------------
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
        <td className="d-flex gap-1 ">
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
          {/*9.1 -------------Colonna 1: Playlist salvate--------------- */}
          <PlaylistCol1
            savedPlaylists={savedPlaylists}
            expandedPlaylists={expandedPlaylists}
            togglePlaylist={togglePlaylist}
            setIsBuilding={setIsBuilding}
            setSelectedTracks={setSelectedTracks}
            setSelectedAlbum={setSelectedAlbum}
          />

          {/*9.2 -----------Colonna 2: Tracce della playlist----------------- */}
          <PlaylistCol2
            savedPlaylists={savedPlaylists}
            expandedPlaylists={expandedPlaylists}
            editingPlaylistId={editingPlaylistId}
            editedName={editedName}
            setEditedName={setEditedName}
            startEditingName={startEditingName}
            saveEditedName={saveEditedName}
            getPlaylistDuration={getPlaylistDuration}
            reorderMode={reorderMode}
            setReorderMode={setReorderMode}
            setSavedPlaylists={setSavedPlaylists}
            editingSongs={editingSongs}
            setEditingSongs={setEditingSongs}
            renderTrackRow={renderTrackRow}
            handleDeletePlaylist={handleDeletePlaylist}
            setShowAddTrackModal={setShowAddTrackModal}
            setPlaylistBeingEdited={setPlaylistBeingEdited}
          />

          {/*9.3--- Colonna 3: Builder nuova playlist */}
          <PlaylistCol3
            isBuilding={isBuilding}
            songQuery={songQuery}
            setSongQuery={setSongQuery}
            searchSongsByTitle={searchSongsByTitle}
            artistQuery={artistQuery}
            setArtistQuery={setArtistQuery}
            handleArtistSearchChange={handleArtistSearchChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchChange={handleSearchChange}
            searchResults={searchResults}
            expandedAlbumId={expandedAlbumId}
            setExpandedAlbumId={setExpandedAlbumId}
            setSelectedAlbum={setSelectedAlbum}
            selectedAlbum={selectedAlbum}
            selectedTracks={selectedTracks}
            handleToggleTrack={handleToggleTrack}
          />
        </Row>
      </Container>
      {/*10.------------Modali------------------*/}
      {/* 10.1 Modale per tracce selezionate */}
      {showTrackModal && (
        <TrackSelectionModal
          selectedTracks={selectedTracks}
          setSelectedTracks={setSelectedTracks}
          playlistName={playlistName}
          setPlaylistName={setPlaylistName}
          setSelectedAlbum={setSelectedAlbum}
          setShowTrackModal={setShowTrackModal}
          setSongQuery={setSongQuery}
          setSearchQuery={setSearchQuery}
          setArtistQuery={setArtistQuery}
          handleSavePlaylist={handleSavePlaylist}
        />
      )}

      {/*10.2 Modale per aggiungere tracce a una playlist */}
      {showAddTrackModal && playlistBeingEdited && (
        <AddTrackModal
          playlistBeingEdited={playlistBeingEdited}
          setPlaylistBeingEdited={setPlaylistBeingEdited}
          setShowAddTrackModal={setShowAddTrackModal}
          setTrackSearchQuery={setTrackSearchQuery}
          trackSearchQuery={trackSearchQuery}
          trackSearchResults={trackSearchResults}
          setTrackSearchResults={setTrackSearchResults}
          tracksToAdd={tracksToAdd}
          setTracksToAdd={setTracksToAdd}
          setSavedPlaylists={setSavedPlaylists}
        />
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
