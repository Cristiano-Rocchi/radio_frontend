// ==============================
// ✅ PlaylistCol2.jsx
// 1. Import
// 2. Componente
//    2.1 Drag & Drop (SortableRow)
//    2.2 Playlist espanse con azioni (modifica, elimina, riordina)
// ==============================

import React from "react";
import { Col, Button } from "react-bootstrap";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// 2.1 Drag & Drop: Riga ordinabile
const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
};

// 2.2 Componente principale colonna centrale
const PlaylistCol2 = ({
  savedPlaylists,
  expandedPlaylists,
  editingPlaylistId,
  editedName,
  setEditedName,
  startEditingName,
  saveEditedName,
  getPlaylistDuration,
  reorderMode,
  setReorderMode,
  setSavedPlaylists,
  editingSongs,
  setEditingSongs,
  renderTrackRow,
  handleDeletePlaylist,
}) => {
  return (
    <Col xs={7} className="playlist-column-center">
      {/* Playlist espanse */}
      {expandedPlaylists.length > 0 &&
        savedPlaylists
          .filter((pl) => expandedPlaylists.includes(pl.id))
          .map((playlist) => (
            <div key={playlist.id} className="saved-playlist">
              {/* Modifica nome playlist */}
              <div className="mb-2 d-flex align-items-center gap-3">
                {editingPlaylistId === playlist.id ? (
                  <>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="form-control form-control-sm me-2"
                      style={{ width: "200px" }}
                    />
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => saveEditedName(playlist.id)}
                    >
                      OK
                    </button>
                  </>
                ) : (
                  <>
                    <h5 className="mb-0 me-2">{playlist.name}</h5>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => startEditingName(playlist)}
                    >
                      ✏️Modifica nome
                    </button>
                  </>
                )}
              </div>

              {/* Durata totale */}
              <h5 className="fs-6">
                Durata: {getPlaylistDuration(playlist.tracks)}
              </h5>

              {/* Azioni playlist */}
              <div className="d-flex justify-content-start mb-2 mt-3 gap-3">
                <Button
                  variant={
                    reorderMode[playlist.id] ? "success" : "outline-primary"
                  }
                  size="sm"
                  onClick={() => {
                    if (reorderMode[playlist.id]) {
                      const updated = savedPlaylists.find(
                        (pl) => pl.id === playlist.id
                      );
                      fetch(
                        `http://localhost:3001/playlist/${playlist.id}/order`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(updated.tracks.map((t) => t.id)),
                        }
                      );
                    }
                    setReorderMode((prev) => ({
                      ...prev,
                      [playlist.id]: !prev[playlist.id],
                    }));
                  }}
                >
                  {reorderMode[playlist.id]
                    ? "💾 Salva ordine"
                    : "📝 Modifica ordine"}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeletePlaylist(playlist.id)}
                >
                  🗑️ Elimina playlist
                </Button>
              </div>

              {/* Tabella tracce */}
              <table className="table table-striped playlist-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>Artista</th>
                    <th>Album</th>
                    <th>Rating</th>
                    <th>Level</th>
                    <th>Durata</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                {reorderMode[playlist.id] ? (
                  // Modalità riordino con drag and drop
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                      const { active, over } = event;
                      if (!over || active.id === over.id) return;

                      const oldIndex = playlist.tracks.findIndex(
                        (t) => t.id === active.id
                      );
                      const newIndex = playlist.tracks.findIndex(
                        (t) => t.id === over.id
                      );
                      const reordered = arrayMove(
                        playlist.tracks,
                        oldIndex,
                        newIndex
                      );

                      setSavedPlaylists((prev) =>
                        prev.map((pl) =>
                          pl.id === playlist.id
                            ? { ...pl, tracks: reordered }
                            : pl
                        )
                      );
                    }}
                  >
                    <SortableContext
                      items={playlist.tracks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody>
                        {playlist.tracks.map((track, index) => (
                          <SortableRow key={track.id} id={track.id}>
                            {renderTrackRow(track, index, playlist)}
                          </SortableRow>
                        ))}
                      </tbody>
                    </SortableContext>
                  </DndContext>
                ) : (
                  // Modalità normale
                  <tbody>
                    {playlist.tracks.map((track, index) => (
                      <tr key={track.id}>
                        {renderTrackRow(track, index, playlist)}
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          ))}
    </Col>
  );
};

export default PlaylistCol2;
