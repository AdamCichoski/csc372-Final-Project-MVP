import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiDelete, apiPut, API_BASE_URL } from "../api.js";
import NoteTable from "../components/NoteTable.jsx";
import NoteForm from "../components/NoteForm.jsx";

export default function GameDetailPage() {
  const { id } = useParams(); // gamePacketId
  const [game, setGame] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const navigate = useNavigate();

  async function loadGameAndNotes() {
    setLoading(true);
    try {
      // Get all games, then find this one
      const games = await apiGet("/api/games");
      const found = games.find((g) => String(g.id) === String(id));
      setGame(found || null);

      const noteData = await apiGet(`/api/notes/${id}`);
      setNotes(noteData);
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        navigate("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGameAndNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDeleteNote(note) {
    if (!window.confirm("Delete this note?")) return;
    try {
      await apiDelete(`/api/notes/${note.id}`);
      setNotes((n) => n.filter((x) => x.id !== note.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete note.");
    }
  }

  async function handleSaveNote({ noteText, file }) {
    // This function will be passed to NoteForm
    try {
      if (editingNote) {
        // Update note text only
        await apiPut(`/api/notes/${editingNote.id}`, { noteText });
      } else {
        // Create note with optional file using FormData
        const formData = new FormData();
        formData.append("noteText", noteText);
        if (file) {
          formData.append("file", file);
        }

        // Use fetch directly because api.js auto-JSONs bodies
        const res = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Failed to create note (${res.status})`);
        }
      }

      setEditingNote(null);
      await loadGameAndNotes();
    } catch (err) {
      console.error(err);
      alert("Failed to save note.");
    }
  }

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate("/games")}>
        ← Back to games
      </button>

      <h1 className="section-title" style={{ marginTop: "0.75rem" }}>
        {game ? game.title : "Game Details"}
      </h1>

      {game && game.steam_app_id && (
        <p className="helper-text">
          Linked Steam App ID: <span className="chip">{game.steam_app_id}</span>
        </p>
      )}

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="card-header">
          <div className="card-title">
            {editingNote ? "Edit note" : "Add new note"}
          </div>
          <div className="card-subtitle">
            Notes are displayed below in a compact table view.
          </div>
        </div>
        <NoteForm
          gameId={id}
          editingNote={editingNote}
          onSave={handleSaveNote}
          onCancel={() => setEditingNote(null)}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Notes</div>
          <div className="card-subtitle">
            Click “Edit” to adjust the text, or use the attachment link to open
            files like spreadsheets.
          </div>
        </div>

        {loading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Add your first run above.</p>
        ) : (
          <NoteTable
            notes={notes}
            onEdit={(note) => setEditingNote(note)}
            onDelete={handleDeleteNote}
          />
        )}
      </div>
    </div>
  );
}
