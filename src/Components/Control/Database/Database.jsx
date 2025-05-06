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
                    className="album-box"
                    onClick={() => handleSelectAlbum(album)}
                  >
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
                  className="album-box"
                  onClick={() => handleSelectAlbum(album)}
                >
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
              {selectedAlbum.songs.map((song) => (
                <li
                  key={song.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  🎵 {song.titolo}
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
    </div>
  );
};

export default Database;
