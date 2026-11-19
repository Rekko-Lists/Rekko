import { useEffect, useRef, type ReactNode } from 'react';

export default function ListDialog({ label, onClose, children }: {
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      aria-modal="true"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-black/50 p-4 backdrop-blur-sm open:flex open:items-center open:justify-center"
    >
      {children}
    </dialog>
  );
}
