// ==============================
// ✅ PlaylistCol1.jsx
// 1. Import
// 2. Componente
//    2.1 Stato UI e azioni

// ==============================

import React from "react";
import { Col } from "react-bootstrap";

// 2. Componente
const PlaylistCol1 = ({
  savedPlaylists,
  expandedPlaylists,
  togglePlaylist,
  setIsBuilding,
  setSelectedTracks,
  setSelectedAlbum,
}) => {
  return (
    <Col xs={2} className="playlist-column-left">
      <h5 className="text-center">Playlist Salvate</h5>
      {/* 2.1 Azione nuova playlist */}
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
      {/* 2.1 Lista playlist salvate */}
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
  );
};

export default PlaylistCol1;
