import { useEffect, useState } from "react";

export default function NoteForm({ editingNote, onSave, onCancel }) {
  const [noteText, setNoteText] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingNote) {
      setNoteText(editingNote.note_text);
      setFile(null);
    } else {
      setNoteText("");
      setFile(null);
    }
  }, [editingNote]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSave({ noteText, file });
      setNoteText("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="input-group">
        <label htmlFor="noteText">
          Note text
          <span className="helper-text">
            {" "}
            – ideal for runs, routes, collections, etc.
          </span>
        </label>
        <textarea
          id="noteText"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="file">
          Optional attachment
          <span className="helper-text">
            {" "}
            Spreadsheets, planning docs, etc.
          </span>
        </label>
        <input
          id="file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <div className="error-text">{error}</div>}

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving
            ? editingNote
              ? "Saving changes..."
              : "Adding note..."
            : editingNote
            ? "Save changes"
            : "Add note to this game"}
        </button>
        {editingNote && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
