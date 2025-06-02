import React from "react";
import { Badge, Button } from "react-bootstrap";
import { useContext } from "react";
import { SettingsContext } from "../../../Settings/SettingsContext";

const ModalSongs = ({
  album,
  editingSongs,
  handleSaveSong,
  setEditingSongs,
  onClose,
}) => {
  const { darkMode } = useContext(SettingsContext);
  if (!album) return null;

  const handleInputChange = (songId, field, value) => {
    setEditingSongs((prev) => ({
      ...prev,
      [songId]: {
        ...prev[songId],
        [field]: value,
      },
    }));
  };

  return (
    <div className={`modal-songs ${darkMode ? "dark-mode" : ""}`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Album: {album.title}</h5>
        <Button variant="outline-danger" size="sm" onClick={onClose}>
          ❌
        </Button>
      </div>

      {album.songs && album.songs.length > 0 ? (
        <ul className="list-group">
          {album.songs.map((song) => {
            const isEditing = editingSongs[song.id]?.isEditing || false;
            const editedRating =
              editingSongs[song.id]?.editedRating ?? song.rating ?? 0;
            const editedLevel =
              editingSongs[song.id]?.editedLevel ?? song.level ?? 0;
            const editedTitle =
              editingSongs[song.id]?.editedTitle ?? song.titolo ?? "";

            const handleEditClick = () => {
              if (isEditing) {
                handleSaveSong(song.id, editedRating, editedLevel, editedTitle);
              } else {
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
                        handleInputChange(
                          song.id,
                          "editedTitle",
                          e.target.value
                        )
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
                          handleInputChange(
                            song.id,
                            "editedRating",
                            e.target.value
                          )
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
                          handleInputChange(
                            song.id,
                            "editedLevel",
                            e.target.value
                          )
                        }
                        style={{ width: "60px", marginLeft: "5px" }}
                      />
                    ) : (
                      song.level ?? 0
                    )}
                  </Badge>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-2"
                  onClick={handleEditClick}
                >
                  {isEditing ? "Salva" : "Modifica"}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted">Nessuna traccia disponibile.</p>
      )}
    </div>
  );
};

export default ModalSongs;
