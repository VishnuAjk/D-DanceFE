'use client';

import { useEffect, useId, useRef } from 'react';

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
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]') ?? []);
    focusable()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
      if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div className="entity-modal">
      <button className="entity-modal__backdrop" type="button" aria-label="Close dialog" onClick={onClose} />
      <div ref={panelRef} className="entity-modal__panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="entity-modal__header">
          <div>
            <p className="dashboard__eyebrow">Edit</p>
            <h2 id={titleId} className="entity-modal__title">{title}</h2>
            <p className="auth-card__text">{description}</p>
          </div>
          <button className="icon-button" aria-label="Close dialog" type="button" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
