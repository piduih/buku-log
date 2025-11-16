import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-surface w-full max-w-sm rounded-xl shadow-2xl p-6 text-center sm:text-left">
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <p className="mt-2 text-text-secondary">{message}</p>
        <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
          <button type="button" onClick={handleConfirm} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-white shadow-lg">Padam</button>
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-text-primary font-semibold">Batal</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
