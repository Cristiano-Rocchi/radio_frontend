import React, { useEffect, useState } from "react";
import "./Database.css";
import { Button, Badge } from "react-bootstrap";

const Database = () => {
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [editingSongs, setEditingSongs] = useState({});

  useEffect(() => {
    fetchGenres();
    fetchAlbums();
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

  const handleSelectGenre = (genre) => {
    setSelectedGenre(genre);
    setSelectedAlbum(null);
  };

  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album);
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
  };

  // 🔥 Ricerca combinata
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
      setSelectedGenre(null);
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

  const handleDeleteAlbum = async (albumId, albumTitle) => {
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare l'album "${albumTitle}"?`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:3001/album/${albumId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Rimuovi subito dalla lista locale
        setAlbums((prev) => prev.filter((album) => album.id !== albumId));
        setSearchResults((prev) =>
          prev.filter((album) => album.id !== albumId)
        );
        alert(`Album "${albumTitle}" eliminato con successo.`);
      } else {
        alert("Errore durante l'eliminazione dell'album.");
      }
    } catch (error) {
      console.error("Errore nella richiesta DELETE:", error);
      alert("Errore di rete durante l'eliminazione.");
    }
  };

  const handleSaveSong = async (songId, rating, level, title) => {
    if (rating < 0 || rating > 10) {
      alert("Il rating deve essere tra 0 e 10.");
      return;
    }
    if (level < 0 || level > 100) {
      alert("Il level deve essere tra 0 e 100.");
      return;
    }
    if (!title.trim()) {
      alert("Il titolo non può essere vuoto.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titolo", title); // ✅ aggiunto titolo
      formData.append("rating", rating);
      formData.append("level", level);

      const response = await fetch(`http://localhost:3001/song/${songId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        alert("✅ Song aggiornata con successo.");
        // Aggiorna localmente la song aggiornata dentro selectedAlbum
        setSelectedAlbum((prevAlbum) => ({
          ...prevAlbum,
          songs: prevAlbum.songs.map((s) =>
            s.id === songId ? { ...s, titolo: title, rating, level } : s
          ),
        }));
        // Esci dalla modalità modifica
        setEditingSongs((prev) => ({
          ...prev,
          [songId]: { ...prev[songId], isEditing: false },
        }));
      } else {
        alert("❌ Errore durante l'aggiornamento della song.");
      }
    } catch (error) {
      console.error("Errore durante la PUT:", error);
      alert("❌ Errore di rete durante l'aggiornamento.");
    }
  };

  const genreFilteredAlbums = selectedGenre
    ? albums.filter((album) => album.genreId === selectedGenre.id)
    : albums;

  return (
    <div className="database">
      {/* Barra dei Generi (nascosta quando cerchi) */}
      {searchQuery.trim() === "" && artistQuery.trim() === "" && (
        <div className="genres-bar mb-3">
          {genres.map((genre) => (
            <Button
              key={genre.id}
              variant={
                selectedGenre?.id === genre.id ? "primary" : "outline-primary"
              }
              className="genre-btn"
              onClick={() => handleSelectGenre(genre)}
            >
              {genre.name}
            </Button>
          ))}
        </div>
      )}

      {/* 🔍 Input di ricerca titolo */}
      <div className="d-flex mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Cerca album per nome..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* 🔍 Input di ricerca artista */}
      <div className="d-flex mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Cerca album per artista..."
          value={artistQuery}
          onChange={handleArtistSearchChange}
        />
      </div>

      {/* Navigazione */}
      {selectedGenre &&
        searchQuery.trim() === "" &&
        artistQuery.trim() === "" && (
          <div className="navigation mb-3">
            <small className="d-flex">
              <strong>Navigazione:</strong>{" "}
              <span className="nav-link" onClick={() => setSelectedGenre(null)}>
                Tutti i Generi
              </span>{" "}
              {">"} {selectedGenre.name}
              {selectedAlbum && (
                <>
                  {" "}
                  {">"}{" "}
                  <span className="nav-link" onClick={handleBackToAlbums}>
                    {selectedAlbum.title}
                  </span>
                </>
              )}
            </small>
          </div>
        )}

      {/* Risultati ricerca */}
      {(searchQuery.trim() !== "" || artistQuery.trim() !== "") && (
        <div className="search-results mb-4">
          {searchResults.length > 0 ? (
            <>
              <h6>Risultati ricerca:</h6>
              <div className="albums-container">
                {searchResults.map((album) => (
                  <div
                    key={album.id}
                    className="album-box position-relative"
                    onClick={() => handleSelectAlbum(album)}
                  >
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // ⚠️ Previene il click sulla scheda
                        handleDeleteAlbum(album.id, album.title);
                      }}
                    >
                      ❌
                    </button>
                    📁 <div>{album.title}</div>
                    <small className="text-muted">{album.artist}</small>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted">Nessun album trovato.</p>
          )}
        </div>
      )}

      {/* Visualizza tutti gli album solo se NON stai cercando */}
      {searchQuery.trim() === "" &&
        artistQuery.trim() === "" &&
        !selectedAlbum && (
          <div className="albums-container">
            {genreFilteredAlbums.length > 0 ? (
              genreFilteredAlbums.map((album) => (
                <div
                  key={album.id}
                  className="album-box position-relative"
                  onClick={() => handleSelectAlbum(album)}
                >
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // ⚠️ Previene il click sulla scheda
                      handleDeleteAlbum(album.id, album.title);
                    }}
                  >
                    ❌
                  </button>
                  📁 <div>{album.title}</div>
                  <small className="text-muted">{album.artist}</small>
                </div>
              ))
            ) : (
              <p className="text-muted">Nessun album disponibile.</p>
            )}
          </div>
        )}

      {/* Dettaglio album */}
      {selectedAlbum && (
        <div>
          <h6>Album: {selectedAlbum.title}</h6>
          {selectedAlbum.songs && selectedAlbum.songs.length > 0 ? (
            <ul className="list-group">
              {selectedAlbum.songs.map((song) => {
                const isEditing = editingSongs[song.id]?.isEditing || false;
                const editedRating =
                  editingSongs[song.id]?.editedRating ?? song.rating ?? 0;
                const editedLevel =
                  editingSongs[song.id]?.editedLevel ?? song.level ?? 0;
                const editedTitle =
                  editingSongs[song.id]?.editedTitle ?? song.titolo ?? "";

                const handleEditClick = () => {
                  if (isEditing) {
                    // Salva i dati
                    handleSaveSong(
                      song.id,
                      editedRating,
                      editedLevel,
                      editedTitle
                    );
                  } else {
                    // Mette in modalità modifica
                    setEditingSongs((prev) => ({
                      ...prev,
                      [song.id]: {
                        isEditing: true,
                        editedTitle: song.titolo ?? "",
                        editedRating: song.rating ?? 0,
                        editedLevel: song.level ?? 0,
                      },
                    }));
                  }
                };

                const handleInputChange = (field, value) => {
                  setEditingSongs((prev) => ({
                    ...prev,
                    [song.id]: {
                      ...prev[song.id],
                      [field]: value,
                    },
                  }));
                };

                return (
                  <li
                    key={song.id}
                    className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
                  >
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingSongs[song.id]?.editedTitle}
                          onChange={(e) =>
                            handleInputChange("editedTitle", e.target.value)
                          }
                          style={{ width: "200px", marginRight: "10px" }}
                        />
                      ) : (
                        <>🎵 {song.titolo} </>
                      )}
                      <Badge bg="secondary" className="me-2">
                        {song.duration ? `${song.duration} sec` : "Durata N/A"}
                      </Badge>

                      <Badge bg="info" className="me-2">
                        Rating:{" "}
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={editedRating}
                            onChange={(e) =>
                              handleInputChange("editedRating", e.target.value)
                            }
                            style={{ width: "50px", marginLeft: "5px" }}
                          />
                        ) : (
                          song.rating ?? 0
                        )}
                      </Badge>
                      <Badge bg="warning" className="me-2">
                        Level:{" "}
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editedLevel}
                            onChange={(e) =>
                              handleInputChange("editedLevel", e.target.value)
                            }
                            style={{ width: "60px", marginLeft: "5px" }}
                          />
                        ) : (
                          song.level ?? 0
                        )}
                      </Badge>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={handleEditClick}
                    >
                      {isEditing ? "Salva" : "Modifica"}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted">Nessuna traccia disponibile.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Database;
