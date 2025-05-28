// ==============================
// ✅ INDICE
// 1. Import
// 2. Stato e costanti iniziali
//   2.1 Stati di navigazione (step)
//   2.2 Liste (generi, album)
//   2.3 Form album e canzoni
// 3. Effetti iniziali
// 4. Fetch dati
//   4.1 fetchGenres
//   4.2 fetchAlbums
// 5. Gestione form
//   5.1 handleAlbumChange
//   5.2 handleSongChange
// 6. Upload
//   6.1 uploadAlbumsSequentially
//   6.2 uploadSongsSequentially
// ==============================

import React, { useEffect, useState } from "react";
import "./Upload.css";
import { Button, Form, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { SettingsContext } from "../Settings/SettingsContext";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

// 2. Stato e costanti iniziali

// 2.1 Stati di navigazione (step)
const Upload = () => {
  const [step, setStep] = useState("start"); // start | chooseGenre | uploadAlbum | uploadSong

  // 2.2 Liste (generi, album)
  const [genres, setGenres] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  // 2.3 Form album e canzoni
  const AlbumNumberForms = 20; // Numero di form per gli album

  const { albumFormCount, songFormCount, darkMode } =
    useContext(SettingsContext);

  const [albumForms, setAlbumForms] = useState(() =>
    Array.from({ length: albumFormCount }, () => ({
      artist: "",
      title: "",
      year: "",
      file: null,
      status: "ready",
    }))
  );

  const [songForms, setSongForms] = useState(() =>
    Array.from({ length: songFormCount }, () => ({
      genreId: "",
      albumId: "",
      rating: "",
      level: "",
      subgenre: "",
      file: null,
      status: "ready",
    }))
  );

  // 2.4 Aggiunta Genere
  const [showAddGenre, setShowAddGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");

  const handleAddGenre = async () => {
    if (!newGenreName.trim()) return;

    const formatted = newGenreName.trim().toUpperCase().replaceAll(" ", "_");

    try {
      const response = await fetch("http://localhost:3001/genre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formatted }),
      });

      if (response.ok) {
        setNewGenreName("");
        setShowAddGenre(false);
        fetchGenres(); // aggiorna la lista
      } else {
        console.error("Errore aggiunta genere");
      }
    } catch (err) {
      console.error("Errore di rete", err);
    }
  };

  // 3. Effetti iniziali
  useEffect(() => {
    if (step !== "start") {
      fetchGenres();
      fetchAlbums();
    }
  }, [step]);

  useEffect(() => {
    setAlbumForms(
      Array.from({ length: albumFormCount }, () => ({
        artist: "",
        title: "",
        year: "",
        file: null,
        status: "ready",
      }))
    );
  }, [albumFormCount]);

  useEffect(() => {
    setSongForms(
      Array.from({ length: songFormCount }, () => ({
        genreId: "",
        albumId: "",
        rating: "",
        level: "",
        subgenre: "",
        file: null,
        status: "ready",
      }))
    );
  }, [songFormCount]);

  // 4. Fetch dati

  // 4.1 fetchGenres
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

  // 4.2 fetchAlbums
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

  // 5. Gestione form

  // 5.1 handleAlbumChange
  const handleAlbumChange = (index, field, value) => {
    const updated = [...albumForms];
    updated[index][field] = value;
    setAlbumForms(updated);
  };

  // 5.2 handleSongChange
  const handleSongChange = (index, field, value) => {
    const updated = [...songForms];
    updated[index][field] = value;
    setSongForms(updated);
  };

  // 6. Upload

  // 6.1 Upload sequenziale album
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

  // 6.2 Upload sequenziale canzoni
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

  const getAlbumCardStatus = (form) => {
    const isEmpty =
      !form.artist &&
      !form.title &&
      !form.year &&
      (!form.files || form.files.length === 0);

    if (isEmpty) return "empty";

    const isComplete =
      form.artist &&
      form.title &&
      form.year &&
      form.files &&
      form.files.length > 0;

    return isComplete ? "complete" : "incomplete";
  };

  // 7. Render
  return (
    <div className={`upload-page ${darkMode ? "dark-mode" : ""}`}>
      {/* 7.1 Bottoni iniziali */}
      {step === "start" && (
        <div className="button-group">
          <Button
            onClick={() => setStep("chooseGenre")}
            className="upload-page-btn me-3"
          >
            Carica Album
          </Button>
          <Button
            onClick={() => setStep("uploadSong")}
            className="upload-page-btn me-3"
          >
            Carica Traccia Audio
          </Button>
          <Button
            className="upload-page-btn"
            onClick={() => setStep("addGenre")}
          >
            Aggiungi Genere
          </Button>
        </div>
      )}
      {/* 7.2 Aggiungi Genere */}

      {step === "addGenre" && (
        <div className="genre-choice">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Aggiungi Nuovo Genere</h5>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setStep("start")}
            >
              ❌
            </Button>
          </div>
          <Form.Control
            type="text"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="Es. techno hardcore"
            className="mb-2"
          />
          <Button size="sm" variant="success" onClick={handleAddGenre}>
            Aggiungi
          </Button>
        </div>
      )}

      {/* 7.3 Scelta del genere */}
      {step === "chooseGenre" && (
        <div className="genre-choice">
          <div className="d-flex gap-5 mb-3 justify-content-between">
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
              className="upload-page-btn m-1"
              key={genre.id}
              onClick={() => {
                setSelectedGenre(genre);
                setStep("uploadAlbum");
              }}
            >
              {genre.name}
            </Button>
          ))}
        </div>
      )}

      {/* 7.4 Upload Album */}
      {step === "uploadAlbum" && (
        <div>
          <div className="mb-3">
            {" "}
            <Button
              className="mb-2"
              variant="outline-danger"
              size="sm"
              onClick={() => setStep("chooseGenre")}
            >
              ❌
            </Button>
            <div className="d-flex">
              {" "}
              <h5 className="mb-0">
                Genere Selezionato:{" "}
                <strong>{selectedGenre.name.replaceAll("_", " ")}</strong>
              </h5>
              <Tippy
                placement="right"
                interactive={true}
                theme="light-border"
                delay={[200, 0]}
                content={
                  <div className="info-box">
                    <p>
                      &bull; Compila i form con il nome dell’artista, il titolo,
                      l’anno e i file audio da caricare. <br />
                      <br />
                      &bull; Quando hai terminato, scorri fino in fondo alla
                      pagina e premi il pulsante <strong>Upload</strong> per
                      avviare il caricamento.
                      <br /> <br />
                      &bull; Non è necessario compilare tutte le schede:
                      verranno processate solo quelle complete.
                      <br /> <br />
                      &bull; Il numero di schede visibili può essere modificato
                      dal menu <strong>Impostazioni</strong> nella navbar.
                    </p>
                    <br />
                    &bull; Le schede arancioni indicano che sono incomplete,
                    quelle verdi sono complete e quelle grigie sono vuote.
                  </div>
                }
              >
                <p className="fst-italic border border-black rounded-circle d-inline-block p-1 ms-3">
                  info
                </p>
              </Tippy>
            </div>
          </div>

          <div className="upload-cards-container">
            {albumForms.map((form, idx) => {
              const cardStatus = getAlbumCardStatus(form);
              return (
                <div key={idx} className={`upload-card mb-3 p-3 ${cardStatus}`}>
                  <h5 className="text-center mb-1">Album {idx + 1}</h5>

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
                    <Form.Label>Titolo</Form.Label>
                    <Form.Control
                      value={form.title}
                      onChange={(e) =>
                        handleAlbumChange(idx, "title", e.target.value)
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
              );
            })}
          </div>

          <div className="text-center">
            <Button
              className="fs-4"
              variant="success"
              onClick={uploadAlbumsSequentially}
            >
              Upload
            </Button>
          </div>
        </div>
      )}

      {/* 7.5 Upload Canzoni */}
      {step === "uploadSong" && (
        <div>
          <div className=" mb-3">
            {" "}
            <Button
              className="mb-2"
              variant="outline-danger"
              size="sm"
              onClick={() => setStep("start")}
            >
              ❌
            </Button>
            <div className="d-flex">
              {" "}
              <h5 className="mb-0 ">Upload Traccie Audio</h5>
              <Tippy
                placement="right"
                interactive={true}
                theme="light-border"
                delay={[200, 0]}
                content={
                  <div className="info-box m-0">
                    <p>
                      &bull; Compila i form selezionando un{" "}
                      <strong>genere</strong> tra quelli disponibili e un{" "}
                      <strong>album</strong> a cui associare la traccia. Puoi
                      digitare per cercare rapidamente il nome dell’album.
                      <br />
                      <br />
                      &bull; Carica il <strong>file audio</strong> e, se vuoi,
                      aggiungi anche un <strong>rating</strong> (da 1 a 100), un{" "}
                      <strong>livello</strong> (da 1 a 10) e un{" "}
                      <strong>sottogenere</strong>.
                      <br />
                      <br />
                      &bull; Quando hai terminato, scorri fino in fondo alla
                      pagina e premi il pulsante <strong>Upload</strong> per
                      avviare il caricamento.
                      <br />
                      <br />
                      &bull; Non è necessario compilare tutte le schede:
                      verranno processate solo quelle complete.
                      <br />
                      <br />
                      &bull; Il numero di schede visibili può essere modificato
                      nel menu <strong>Impostazioni</strong> nella navbar.
                    </p>
                  </div>
                }
              >
                <p className="fst-italic border border-black rounded-circle d-inline-block p-1 ms-3">
                  info
                </p>
              </Tippy>
            </div>
          </div>

          <div className="upload-cards-container">
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
