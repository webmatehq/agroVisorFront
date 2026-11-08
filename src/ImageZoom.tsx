import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function ImageZoom({ src, alt, children, className, zoomContent }: {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
  zoomContent?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => {
      dialog.current?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return <>
    <a href={src} className={className} aria-label={`Ampliar: ${alt}`} aria-haspopup="dialog"
      onClick={event => { event.preventDefault(); setOpen(true); }}>{children}</a>
    {open && createPortal(
      <dialog ref={dialog} className="image-zoom-dialog" aria-label={alt}
        onCancel={() => setOpen(false)} onClose={() => setOpen(false)}
        onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
        <button type="button" className="image-zoom-close" aria-label="Cerrar vista ampliada" autoFocus onClick={() => setOpen(false)}>×</button>
        {zoomContent || <img src={src} alt={alt}/>}
      </dialog>, document.body)}
  </>;
}
