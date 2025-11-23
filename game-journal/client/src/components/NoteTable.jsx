// client/src/components/NoteTable.jsx
export default function NoteTable({ notes, onEdit, onDelete }) {
  return (
    <table className="notes-table">
      <thead>
        <tr>
          <th>Created</th>
          <th>Note</th>
          <th>Attachment</th>
          <th style={{ width: "130px" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {notes.map((note) => {
          const created = new Date(note.created_at);
          const preview =
            note.note_text.length > 120
              ? note.note_text.slice(0, 120) + "..."
              : note.note_text;

          return (
            <tr key={note.id}>
              <td>{created.toLocaleString()}</td>
              <td>{preview}</td>
              <td>
                {note.file_path ? (
                  <a href={note.file_path} target="_blank" rel="noreferrer">
                    Download
                  </a>
                ) : (
                  <span className="helper-text">None</span>
                )}
              </td>
              <td>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => onEdit(note)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  type="button"
                  onClick={() => onDelete(note)}
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
