import React, { useEffect, useState } from "react";
import "./Upload.css";
import { Button, Form, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

const Upload = () => {
  const [step, setStep] = useState("start"); // start | chooseGenre | uploadAlbum | uploadSong
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const AlbumNumberForms = 20;

  const [albumForms, setAlbumForms] = useState(
    Array.from({ length: AlbumNumberForms }, () => ({
      title: "",
      artist: "",
      year: "",
      file: null,
      status: "ready",
    }))
  );

  const [songForms, setSongForms] = useState(
    Array.from({ length: AlbumNumberForms }, () => ({
      genreId: "",
      albumId: "",
      rating: "",
      level: "",
      subgenre: "",
      file: null,
      status: "ready",
    }))
  );

  useEffect(() => {
    if (step !== "start") {
      fetchGenres();
      fetchAlbums();
    }
  }, [step]);

  const fetchGenres = async () => {
    try {
      const response = await fetch("http://localhost:3001/genre");
      if (response.ok) {
        const data = await response.json();
        setGenres(data);
      }
    } catch (err) {
      console.error("Errore fetch generi", err);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await fetch("http://localhost:3001/album");
      if (response.ok) {
        const data = await response.json();
        setAlbums(data);
      }
    } catch (err) {
      console.error("Errore fetch albums", err);
    }
  };

  const handleAlbumChange = (index, field, value) => {
    const updated = [...albumForms];
    updated[index][field] = value;
    setAlbumForms(updated);
  };

  const handleSongChange = (index, field, value) => {
    const updated = [...songForms];
    updated[index][field] = value;
    setSongForms(updated);
  };

  const uploadAlbumsSequentially = async () => {
    setAlbumForms((prev) =>
      prev.map((form) =>
        form.title &&
        form.artist &&
        form.year &&
        form.files &&
        form.files.length > 0
          ? { ...form, status: "queued" }
          : form
      )
    );

    for (let i = 0; i < albumForms.length; i++) {
      const album = albumForms[i];

      if (
        !album.title ||
        !album.artist ||
        !album.year ||
        !album.files ||
        album.files.length === 0
      ) {
        continue; // salta schede vuote o incomplete
      }

      handleAlbumChange(i, "status", "uploading");

      const formData = new FormData();
      formData.append("genreId", selectedGenre.id);
      formData.append("title", album.title);
      formData.append("artist", album.artist);
      formData.append("date", album.year);

      // ⬇️ Aggiungi TUTTI i file al campo "songs"
      album.files.forEach((file) => {
        formData.append("songs", file);
      });

      try {
        const response = await fetch("http://localhost:3001/album", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          handleAlbumChange(i, "status", "success");
        } else {
          console.error(`Errore upload album: ${album.title}`);
          handleAlbumChange(i, "status", "error");
        }
      } catch (err) {
        console.error(`Errore di rete per album: ${album.title}`, err);
        handleAlbumChange(i, "status", "error");
      }
    }
  };

  const uploadSongsSequentially = async () => {
    setSongForms((prev) =>
      prev.map((form) =>
        form.genreId && form.albumId && form.file
          ? { ...form, status: "queued" }
          : form
      )
    );

    for (let i = 0; i < songForms.length; i++) {
      const song = songForms[i];
      if (!song.genreId || !song.albumId || !song.file) continue;
      handleSongChange(i, "status", "uploading");

      const formData = new FormData();
      formData.append("genreId", song.genreId);
      formData.append("albumId", song.albumId);
      if (song.rating) formData.append("rating", song.rating);
      if (song.level) formData.append("level", song.level);
      if (song.subgenre) formData.append("subgenre", song.subgenre);
      formData.append("songs", song.file);

      try {
        const response = await fetch("http://localhost:3001/song", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          handleSongChange(i, "status", "success");
        } else {
          handleSongChange(i, "status", "error");
        }
      } catch (err) {
        handleSongChange(i, "status", "error");
      }
    }
  };

  return (
    <div className="upload-page">
      <div className="side-navbar">
        <div className="nav-item">
          <Link to="/">
            <h5>Home</h5>
          </Link>
        </div>
        <div className="nav-item">
          <Link to="/control">
            <h5>Control</h5>
          </Link>
        </div>
      </div>
      {step === "start" && (
        <div className="button-group">
          <Button onClick={() => setStep("chooseGenre")} className="me-3">
            Carica Album
          </Button>
          <Button onClick={() => setStep("uploadSong")}>Carica Canzone</Button>
        </div>
      )}

      {step === "chooseGenre" && (
        <div>
          <div className="d-flex gap-5 mb-3">
            <h5 className="mb-0">Scegli un genere:</h5>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setStep("start")}
            >
              ❌
            </Button>
          </div>
          {genres.map((genre) => (
            <Button
              key={genre.id}
              onClick={() => {
                setSelectedGenre(genre);
                setStep("uploadAlbum");
              }}
              className="m-1"
            >
              {genre.name}
            </Button>
          ))}
        </div>
      )}

      {step === "uploadAlbum" && (
        <div>
          <div className="d-flex gap-5 mb-3">
            <h5 className="mb-0">
              Upload Album - Genere: {selectedGenre.name}
            </h5>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setStep("chooseGenre")}
            >
              ❌
            </Button>
          </div>

          <div className="upload-cards-container">
            {" "}
            {albumForms.map((form, idx) => (
              <div key={idx} className="upload-card mb-3 p-3 border rounded">
                <h6>Album {idx + 1}</h6>
                <Form.Group>
                  <Form.Label>Titolo</Form.Label>
                  <Form.Control
                    value={form.title}
                    onChange={(e) =>
                      handleAlbumChange(idx, "title", e.target.value)
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Artista</Form.Label>
                  <Form.Control
                    value={form.artist}
                    onChange={(e) =>
                      handleAlbumChange(idx, "artist", e.target.value)
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Anno</Form.Label>
                  <Form.Control
                    value={form.year}
                    onChange={(e) =>
                      handleAlbumChange(idx, "year", e.target.value)
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Files</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={(e) =>
                      handleAlbumChange(
                        idx,
                        "files",
                        Array.from(e.target.files)
                      )
                    }
                  />
                </Form.Group>

                <div className="mt-2">
                  {form.status === "uploading" && (
                    <Spinner animation="border" size="sm" className="me-2" />
                  )}
                  {form.status === "uploading" && "Upload in corso..."}
                  {form.status === "queued" && "In coda"}
                  {form.status === "success" && "✅ Upload completato"}
                  {form.status === "error" && "❌ Errore"}
                </div>
              </div>
            ))}
          </div>

          <Button variant="success" onClick={uploadAlbumsSequentially}>
            Upload
          </Button>
        </div>
      )}

      {step === "uploadSong" && (
        <div>
          <div className="d-flex gap-5 mb-3">
            <h5 className="mb-0">Upload Canzoni</h5>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setStep("start")}
            >
              ❌
            </Button>
          </div>
          <div className="upload-cards-container">
            {" "}
            {songForms.map((form, idx) => (
              <div key={idx} className="upload-card mb-3 p-3 border rounded">
                <h6>Canzone {idx + 1}</h6>
                <Form.Group>
                  <Form.Label>Genere</Form.Label>
                  <Form.Select
                    value={form.genreId}
                    onChange={(e) =>
                      handleSongChange(idx, "genreId", e.target.value)
                    }
                  >
                    <option value="">Seleziona un genere</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Album</Form.Label>
                  <Form.Select
                    value={form.albumId}
                    onChange={(e) =>
                      handleSongChange(idx, "albumId", e.target.value)
                    }
                  >
                    <option value="">Seleziona un album</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Rating (opzionale)</Form.Label>
                  <Form.Control
                    value={form.rating}
                    onChange={(e) =>
                      handleSongChange(idx, "rating", e.target.value)
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Level (opzionale)</Form.Label>
                  <Form.Control
                    value={form.level}
                    onChange={(e) =>
                      handleSongChange(idx, "level", e.target.value)
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Subgenere (opzionale)</Form.Label>
                  <Form.Control
                    value={form.subgenre}
                    onChange={(e) =>
                      handleSongChange(idx, "subgenre", e.target.value)
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>File</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) =>
                      handleSongChange(idx, "file", e.target.files[0])
                    }
                  />
                </Form.Group>
                <div className="mt-2">
                  {form.status === "uploading" && (
                    <Spinner animation="border" size="sm" className="me-2" />
                  )}
                  {form.status === "uploading" && "Upload in corso..."}
                  {form.status === "queued" && "In coda"}
                  {form.status === "success" && "✅ Upload completato"}
                  {form.status === "error" && "❌ Errore"}
                </div>
              </div>
            ))}
          </div>

          <Button variant="success" onClick={uploadSongsSequentially}>
            Upload
          </Button>
        </div>
      )}
    </div>
  );
};

export default Upload;
