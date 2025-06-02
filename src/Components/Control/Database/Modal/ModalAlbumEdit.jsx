// ==============================
// ✅ INDICE
// 1. Import
// 2. Props
// 3. Funzione handleSave
// 4. Render JSX
// ==============================

// 1. Import
import React from "react";
import { useContext } from "react";
import { SettingsContext } from "../../../Settings/SettingsContext";

// 2. Props
const ModalAlbumEdit = ({
  albumInEdit,
  editedAlbum,
  setEditedAlbum,
  setAlbumInEdit,
  setAlbums,
  setSearchResults,
}) => {
  const { darkMode } = useContext(SettingsContext);
  if (!albumInEdit) return null;

  // 3. Funzione handleSave
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editedAlbum.title);
      formData.append("artist", editedAlbum.artist);
      formData.append("date", editedAlbum.date);

      const res = await fetch(`http://localhost:3001/album/${albumInEdit.id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setAlbums((prev) =>
          prev.map((a) =>
            a.id === albumInEdit.id ? { ...a, ...editedAlbum } : a
          )
        );
        setSearchResults((prev) =>
          prev.map((a) =>
            a.id === albumInEdit.id ? { ...a, ...editedAlbum } : a
          )
        );
        setAlbumInEdit(null);
      } else {
        alert("Errore durante il salvataggio.");
      }
    } catch (error) {
      console.error("Errore PUT album:", error);
      alert("Errore di rete.");
    }
  };

  // 4. Render JSX
  return (
    <div className={`modal-edit-album ${darkMode ? "dark-mode" : ""}`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Modifica Album</h5>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => setAlbumInEdit(null)}
        >
          ❌
        </button>
      </div>

      <div className="mb-2">
        <label className="form-label">Titolo:</label>
        <input
          type="text"
          className="form-control"
          value={editedAlbum.title}
          onChange={(e) =>
            setEditedAlbum((prev) => ({ ...prev, title: e.target.value }))
          }
        />
      </div>
      <div className="mb-2">
        <label className="form-label">Artista:</label>
        <input
          type="text"
          className="form-control"
          value={editedAlbum.artist}
          onChange={(e) =>
            setEditedAlbum((prev) => ({ ...prev, artist: e.target.value }))
          }
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Anno:</label>
        <input
          type="number"
          className="form-control"
          value={editedAlbum.date}
          onChange={(e) =>
            setEditedAlbum((prev) => ({
              ...prev,
              date: parseInt(e.target.value),
            }))
          }
        />
      </div>

      <button className="btn btn-success w-100" onClick={handleSave}>
        OK
      </button>
    </div>
  );
};

export default ModalAlbumEdit;
