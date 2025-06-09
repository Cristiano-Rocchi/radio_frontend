// ==============================
// ✅ TrackSelectionModal.jsx
// 1. Import
// 2. Componente
//    2.1 Calcolo durata
//    2.2 Rimozione tracce
//    2.3 Azioni salva / annulla
// ==============================

import React from "react";
import { Button } from "react-bootstrap";

// 2. Componente modale per confermare tracce selezionate e salvare playlist
const TrackSelectionModal = ({
  selectedTracks,
  setSelectedTracks,
  playlistName,
  setPlaylistName,
  setSelectedAlbum,
  setShowTrackModal,
  setSongQuery,
  setSearchQuery,
  setArtistQuery,
  handleSavePlaylist,
}) => {
  // 2.1 Durata totale tracce selezionate
  const getTotalDuration = () => {
    const totalSeconds = selectedTracks.reduce(
      (sum, track) => sum + (track.duration || 0),
      0
    );
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} min ${seconds} sec`;
  };

  // 2.2 Rimuovi traccia singola
  const handleRemoveTrack = (trackId) => {
    setSelectedTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  // 2.3 Annulla creazione playlist
  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Vuoi annullare la creazione della playlist?"
    );
    if (confirmCancel) {
      setSelectedTracks([]);
      setPlaylistName("");
      setSelectedAlbum(null);
      setShowTrackModal(false);
      setSongQuery("");
      setSearchQuery("");
      setArtistQuery("");
    }
  };

  return (
    <div className="track-modal">
      <h5>Tracce selezionate</h5>
      <p>
        <strong>Durata:</strong> {getTotalDuration()}
      </p>

      {/* Lista tracce selezionate */}
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

      {/* Input nome playlist */}
      <label className="form-label">Nome playlist:</label>
      <input
        type="text"
        className="form-control mb-2"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
      />

      {/* Bottoni azione */}
      <Button variant="success" className="w-100" onClick={handleSavePlaylist}>
        Salva
      </Button>
      <Button
        variant="outline-secondary"
        className="w-100 mt-2"
        onClick={handleCancel}
      >
        Annulla
      </Button>
    </div>
  );
};

export default TrackSelectionModal;
