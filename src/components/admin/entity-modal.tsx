'use client';

export function EntityModal({
  title,
  description,
  children,
  onClose
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="entity-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="entity-modal__backdrop" onClick={onClose} />
      <div className="entity-modal__panel">
        <div className="entity-modal__header">
          <div>
            <p className="dashboard__eyebrow">Edit</p>
            <h2 className="entity-modal__title">{title}</h2>
            <p className="auth-card__text">{description}</p>
          </div>
          <button className="button button--ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
