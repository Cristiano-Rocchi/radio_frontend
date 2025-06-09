// ==============================
// ✅ PlaylistCol3.jsx
// 1. Import
// 2. Componente
//    2.1 Input ricerca (canzone, artista, album)
//    2.2 Risultati album e selezione tracce
// ==============================

import React from "react";
import { Col, Badge } from "react-bootstrap";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "../Playlist.css";

// 2. Componente colonna destra (builder playlist)
const PlaylistCol3 = ({
  isBuilding,
  songQuery,
  setSongQuery,
  searchSongsByTitle,
  artistQuery,
  setArtistQuery,
  handleArtistSearchChange,
  searchQuery,
  setSearchQuery,
  handleSearchChange,
  searchResults,
  expandedAlbumId,
  setExpandedAlbumId,
  setSelectedAlbum,
  selectedAlbum,
  selectedTracks,
  handleToggleTrack,
}) => {
  return (
    <Col xs={3} className="playlist-column-right">
      {isBuilding && (
        <div>
          {/* 2.1 Campi di ricerca */}
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

          {/* 2.2 Risultati ricerca album */}
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

                    {/* Espansione canzoni album */}
                    {expandedAlbumId === album.id &&
                      album.songs &&
                      album.songs.length > 0 && (
                        <ul className="list-group mt-2">
                          {album.songs.map((song) => (
                            <li
                              key={song.id}
                              className={`list-group-item d-flex justify-content-between align-items-center${
                                song.playlistCount > 0 ? " in-playlist" : ""
                              }`}
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
                                <Tippy
                                  content={
                                    <div className="tippy-playlist">
                                      <strong>Playlist:</strong>{" "}
                                      {song.playlistCount ?? 0}
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
                                {song.duration ? `${song.duration} sec` : "N/A"}
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

          {/* 2.3 Risultati da campo canzone diretto */}
          {songQuery.trim() !== "" &&
            selectedAlbum &&
            selectedAlbum.songs &&
            selectedAlbum.songs.length > 0 && (
              <ul className="list-group mb-3">
                {selectedAlbum.songs.map((song) => (
                  <li
                    key={song.id}
                    className={`list-group-item d-flex justify-content-between align-items-center${
                      song.playlistCount > 0 ? " in-playlist" : ""
                    }`}
                  >
                    <div className="d-flex align-items-center">
                      <input
                        type="checkbox"
                        className="form-check-input me-2"
                        checked={selectedTracks.some((t) => t.id === song.id)}
                        onChange={() => handleToggleTrack(song)}
                      />
                      🎵 {song.titolo}
                      <Tippy
                        content={
                          <div className="tippy-playlist">
                            <div>
                              <strong>Artista:</strong>{" "}
                              {song.albumArtist || "-"}
                            </div>
                            <div>
                              <strong>Album:</strong> {song.albumTitle || "-"}
                            </div>
                            <div>
                              <strong>Playlist:</strong>{" "}
                              {song.playlistCount ?? 0}
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
                      {song.duration ? `${song.duration} sec` : "N/A"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}
    </Col>
  );
};

export default PlaylistCol3;
