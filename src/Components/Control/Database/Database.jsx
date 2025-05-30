// ==============================
// ✅ INDICE
// 1. Import
// 2. Stato
// 3. Effetti
// 4. Fetch
//   4.1 Fetch generi
//   4.2 Fetch album
// 5. Selezione
//   5.1 Genere
//   5.2 Album
// 6. Ricerca
//   6.1 Titolo
//   6.2 Artista
//   6.3 Esecuzione
// 7. Azioni
//   7.1 Elimina album
//   7.2 Salva canzone
//   7.3 Modifica album
// 8. Utility
//   8.1 Filtra album per genere
// 9. Render
//   9.1 Colonna 1: Generi (sempre visibile)
//   9.2 Colonna 2: Contenuto dinamico (Album | Artista)
// ==============================

import React, { useEffect, useState } from "react";
import "./Database.css";
import { Button, Badge, Nav, Row, Col, Container } from "react-bootstrap";
import ModalSongs from "./Modal/ModalSongs";
import ModalAlbumEdit from "./Modal/ModalAlbumEdit";

// 2. Stato
const Database = () => {
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [artistQuery, setArtistQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [editingSongs, setEditingSongs] = useState({});
  const [activeTab, setActiveTab] = useState("album"); // 'album' | 'artista'
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [albumInEdit, setAlbumInEdit] = useState(null);
  const [editedAlbum, setEditedAlbum] = useState({
    title: "",
    artist: "",
    date: "",
  });

  // 3. Effetti
  useEffect(() => {
    fetchGenres();
    fetchAlbums();
  }, []);

  // 4.1 Fetch generi
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

  // 4.2 Fetch album
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

  // 5.1 Selezione genere
  const handleSelectGenre = (genre) => {
    setSelectedGenre(genre);
    setSelectedAlbum(null);
  };

  // 5.2 Selezione album
  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album);
    setShowAlbumModal(true);
  };

  // 5.3 Torna agli album
  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
  };

  // 🔥 Ricerca combinata
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    performSearch(value, artistQuery);
  };

  // 6.2 Ricerca per artista
  const handleArtistSearchChange = (e) => {
    const value = e.target.value;
    setArtistQuery(value);
    performSearch(searchQuery, value);
  };

  // 6.3 Esecuzione ricerca
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

  // 7.1 Elimina album
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

  // 7.2 Salva canzone
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
      const bodyData = {
        titolo: title,
        rating: parseInt(rating, 10),
        level: parseInt(level, 10),
      };

      const response = await fetch(`http://localhost:3001/song/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
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

  // 8.1 Filtro per genere selezionato
  const genreFilteredAlbums = selectedGenre
    ? albums.filter((album) => album.genreId === selectedGenre.id)
    : albums;

  // 9. Render
  return activeTab === "album" ? (
    <div className="database p-3">
      <Nav
        variant="tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Nav.Item>
          <Nav.Link eventKey="album">Album</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="artista">Artista</Nav.Link>
        </Nav.Item>
      </Nav>
      <Container fluid>
        <Row>
          {/* -------------9.1 Colonna 1: Generi------------- */}
          <Col md={2} className="genres-bar mb-3">
            <div className="mb-3 text-center">
              <h5>GENERI</h5>
            </div>

            <div className="d-flex ">
              {genres.map((genre) => (
                <Button
                  key={genre.id}
                  variant={
                    selectedGenre?.id === genre.id
                      ? "primary"
                      : "outline-primary"
                  }
                  className="genre-btn"
                  onClick={() => handleSelectGenre(genre)}
                >
                  {genre.name}
                </Button>
              ))}
            </div>
          </Col>
          {/* -----------9.2 Colonna 2: DATABASE CONTENUTO----------- */}
          <Col md={9}>
            {/* Search bars & title */}
            <div className="database-search-bars">
              <div className="ms-3 d-flex">
                {" "}
                <h4>DATABASE</h4>
                <div className="d-flex ms-auto me-5">
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Cerca album per nome..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Cerca album per artista..."
                    value={artistQuery}
                    onChange={handleArtistSearchChange}
                  />
                </div>
              </div>
            </div>

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
                              e.stopPropagation();
                              handleDeleteAlbum(album.id, album.title);
                            }}
                          >
                            ❌
                          </button>
                          <button
                            className="edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAlbumInEdit(album);
                              setEditedAlbum({
                                title: album.title,
                                artist: album.artist,
                                date: album.date,
                              });
                            }}
                          >
                            ✏️
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

            {/* Visualizza tutti gli album (solo se NON stai cercando */}
            {searchQuery.trim() === "" && artistQuery.trim() === "" && (
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
                          e.stopPropagation();
                          handleDeleteAlbum(album.id, album.title);
                        }}
                      >
                        ❌
                      </button>
                      <button
                        className="edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlbumInEdit(album);
                          setEditedAlbum({
                            title: album.title,
                            artist: album.artist,
                            date: album.date,
                          });
                        }}
                      >
                        ✏️
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
          </Col>
        </Row>
      </Container>
      {/* Modale per visualizzare trcce dell'album */}
      {showAlbumModal && selectedAlbum && (
        <ModalSongs
          selectedAlbum={selectedAlbum}
          editingSongs={editingSongs}
          handleSaveSong={handleSaveSong}
          setEditingSongs={setEditingSongs}
          onClose={() => setShowAlbumModal(false)}
        />
      )}
      {/* Modale per modificare l'album */}
      {albumInEdit && (
        <ModalAlbumEdit
          albumInEdit={albumInEdit}
          editedAlbum={editedAlbum}
          setEditedAlbum={setEditedAlbum}
          setAlbumInEdit={setAlbumInEdit}
          setAlbums={setAlbums}
          setSearchResults={setSearchResults}
        />
      )}
    </div>
  ) : (
    <div className="database p-3">
      <Nav
        variant="tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Nav.Item>
          <Nav.Link eventKey="album">Album</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="artista">Artista</Nav.Link>
        </Nav.Item>
      </Nav>

      <div className="p-4">
        <h5>Sezione Artista in lavorazione...</h5>
      </div>
    </div>
  );
};

export default Database;
