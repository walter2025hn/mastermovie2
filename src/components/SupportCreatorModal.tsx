import React from 'react';
import { X } from 'lucide-react';
import { SupportCreatorCard } from './SupportCreatorCard';

interface SupportCreatorModalProps {
  onClose: () => void;
}

export const SupportCreatorModal: React.FC<SupportCreatorModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 shadow-lg border border-gray-700 transition"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        <SupportCreatorCard />
      </div>
    </div>
  );
};
