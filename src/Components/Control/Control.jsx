import React, { useEffect, useState } from "react";
import { Col, Container, Row, Button, Badge } from "react-bootstrap";
import "./Control.css"; // 👈 Import del CSS

const Control = () => {
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

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

  const filteredAlbums = selectedGenre
    ? albums.filter((album) => album.genreId === selectedGenre.id)
    : [];

  return (
    <>
      <Container>
        {/* ------------------FIRST SECT ----------------------*/}
        <Row className="first-sect border-bottom border-2 border-black">
          <Col xs={12} md={9}>
            <h5 className="text-center mb-3">Data</h5>

            {/* Barra dei Generi */}
            <div className="genres-bar mb-3">
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

            {/* Navigazione */}
            {selectedGenre && (
              <div className="navigation mb-3">
                <small className="d-flex">
                  <strong>Navigazione:</strong>{" "}
                  <span
                    className="nav-link"
                    onClick={() => setSelectedGenre(null)}
                  >
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

            {!selectedGenre && (
              <p className="text-muted">
                Seleziona un genere per vedere gli album.
              </p>
            )}

            {selectedGenre && !selectedAlbum && (
              <div className="albums-container">
                {filteredAlbums.length > 0 ? (
                  filteredAlbums.map((album) => (
                    <div
                      key={album.id}
                      className="album-box"
                      onClick={() => handleSelectAlbum(album)}
                    >
                      📁 <div>{album.title}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">Nessun album per questo genere.</p>
                )}
              </div>
            )}

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
                          {song.duration
                            ? `${song.duration} sec`
                            : "Durata N/A"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">Nessuna traccia disponibile.</p>
                )}
              </div>
            )}
          </Col>

          <Col xs={12} md={3} className="border-start border-2 border-black">
            <h5 className="text-center">Playlist</h5>
            <p>+ aggiungi playlist</p>
          </Col>
        </Row>

        {/* ------------------SECOND SECT ----------------------*/}

        <Row className="second-sect mt-4">
          <Col xs={12}>
            <h1>Second Sect</h1>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Control;
