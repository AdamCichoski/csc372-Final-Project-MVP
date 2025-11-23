export default function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => {
          e.stopPropagation(); // don’t close when clicking inside
        }}
      >
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
