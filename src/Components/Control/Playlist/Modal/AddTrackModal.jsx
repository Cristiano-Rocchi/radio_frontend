// ==============================
// ✅ AddTrackModal.jsx
// 1. Import
// 2. Componente
//    2.1 Ricerca tracce da aggiungere
//    2.2 Gestione selezione
//    2.3 Azioni conferma / annulla
// ==============================

import React from "react";
import { Button, Badge } from "react-bootstrap";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

// 2. Componente modale per aggiungere tracce a una playlist esistente
const AddTrackModal = ({
  playlistBeingEdited,
  setPlaylistBeingEdited,
  setShowAddTrackModal,
  setTrackSearchQuery,
  trackSearchQuery,
  trackSearchResults,
  setTrackSearchResults,
  tracksToAdd,
  setTracksToAdd,
  setSavedPlaylists,
}) => {
  // 2.2 Toggle selezione traccia
  const handleCheckboxChange = (track) => {
    setTracksToAdd((prev) =>
      prev.some((t) => t.id === track.id)
        ? prev.filter((t) => t.id !== track.id)
        : [...prev, track]
    );
  };

  // 2.3 Conferma aggiunta tracce
  const handleConfirm = async () => {
    const updated = [...playlistBeingEdited.tracks, ...tracksToAdd];
    setSavedPlaylists((prev) =>
      prev.map((pl) =>
        pl.id === playlistBeingEdited.id ? { ...pl, tracks: updated } : pl
      )
    );

    await fetch(
      `http://localhost:3001/playlist/${playlistBeingEdited.id}/songs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tracksToAdd.map((t) => t.id)),
      }
    );

    // cleanup
    setShowAddTrackModal(false);
    setTrackSearchQuery("");
    setTrackSearchResults([]);
    setTracksToAdd([]);
    setPlaylistBeingEdited(null);
  };

  // 2.3 Annulla e chiudi
  const handleCancel = () => {
    setShowAddTrackModal(false);
    setTracksToAdd([]);
    setTrackSearchQuery("");
    setTrackSearchResults([]);
    setPlaylistBeingEdited(null);
  };

  // 2.1 Ricerca live tracce
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setTrackSearchQuery(value);
    if (value.trim().length > 1) {
      const res = await fetch(
        `http://localhost:3001/song/search?title=${encodeURIComponent(value)}`
      );
      if (res.ok) {
        const data = await res.json();
        setTrackSearchResults(data);
      }
    } else {
      setTrackSearchResults([]);
    }
  };

  return (
    <div className="track-modal">
      <h5>Aggiungi tracce a: {playlistBeingEdited.name}</h5>

      {/* Campo di ricerca */}
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Cerca per nome..."
        value={trackSearchQuery}
        onChange={handleSearchChange}
      />

      {/* Lista risultati ricerca */}
      <ul className="list-group mb-3">
        {trackSearchResults.map((track) => (
          <li
            key={track.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center">
              <input
                type="checkbox"
                className="form-check-input me-2"
                checked={tracksToAdd.some((t) => t.id === track.id)}
                onChange={() => handleCheckboxChange(track)}
              />
              🎵 {track.titolo}
              <Tippy
                content={
                  <div className="tippy-playlist">
                    <div>
                      <strong>Artista:</strong> {track.albumArtist || "-"}
                    </div>
                    <div>
                      <strong>Album:</strong> {track.albumTitle || "-"}
                    </div>
                  </div>
                }
                placement="top"
                theme="light-border"
                delay={[150, 0]}
                appendTo={document.body}
              >
                <span
                  style={{
                    cursor: "help",
                    marginLeft: "6px",
                    fontSize: "14px",
                    userSelect: "none",
                  }}
                >
                  ℹ️
                </span>
              </Tippy>
            </div>
            <Badge bg="secondary">
              {track.duration ? `${track.duration} sec` : "N/A"}
            </Badge>
          </li>
        ))}
      </ul>

      {/* Bottoni azione */}
      <Button variant="success" className="w-100 mb-2" onClick={handleConfirm}>
        OK
      </Button>
      <Button
        variant="outline-secondary"
        className="w-100"
        onClick={handleCancel}
      >
        Annulla
      </Button>
    </div>
  );
};

export default AddTrackModal;
