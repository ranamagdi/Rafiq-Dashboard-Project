import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

const Modal = ({ isOpen, onClose, children, className = "" }: ModalProps) => {
  const modalRoot = document.getElementById("modal-root");

  // close on ESC + lock scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !modalRoot) return null;

  // Handle backdrop click - only close if clicking the backdrop itself
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if the target is the backdrop div itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


return createPortal(
  <div
    className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center"
    onClick={handleBackdropClick}
    style={{ isolation: "isolate" }}
  >
    <div
      className={`
        bg-white w-full max-w-md
        rounded-t-2xl md:rounded-lg
        shadow-lg p-6 relative
        animate-slide-up md:animate-none
        ${className}
      `}
      // 1. Stop click bubbling
      onClick={(e) => e.stopPropagation()}
      // 2. Stop touch bubbling (Crucial for mobile)
      onTouchEnd={(e) => e.stopPropagation()} 
      // 3. Stop mouse/pointer bubbling
      onPointerDown={(e) => e.stopPropagation()} 
      style={{ zIndex: 10000, position: "relative" }}
    >
      {children}
    </div>
  </div>,
  modalRoot,
);
};

export default Modal;
