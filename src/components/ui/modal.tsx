import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-brown-dark/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream p-5 rounded-lg shadow-xl w-full max-w-sm relative text-center"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-brown-dark mb-4">{title}</h3>
        <div className="text-sm text-brown-medium mb-6">{children}</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 text-brown-medium hover:bg-gold/20"
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};
export default Modal;
