import React, { useState, useEffect } from 'react';
import { BookIcon, XIcon, PencilIcon, TrashIcon } from './Icons';
import { Logbook } from '../types';

interface LogbookManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  logbooks: Logbook[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

const LogbookManagerModal: React.FC<LogbookManagerModalProps> = ({ isOpen, onClose, logbooks, onAdd, onUpdate, onDelete }) => {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
        setName('');
        setEditingId(null);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (editingId) {
        onUpdate(editingId, name.trim());
      } else {
        onAdd(name.trim());
      }
      setName('');
      setEditingId(null);
    }
  };

  const handleStartEdit = (logbook: Logbook) => {
    setEditingId(logbook.id);
    setName(logbook.name);
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-surface w-full sm:max-w-md rounded-xl shadow-2xl flex flex-col max-h-[90vh] h-full sm:h-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold">Urus Buku Log</h2>
          <button onClick={onClose} className="text-muted hover:text-text-primary"><XIcon /></button>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
            <h3 className="font-semibold">Buku Log Sedia Ada</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {logbooks.length > 0 ? logbooks.map(lb => (
                    <div key={lb.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                      <span>{lb.name}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleStartEdit(lb)} style={{ touchAction: 'manipulation' }} className="text-muted hover:text-primary p-3 rounded-full transition-colors"><PencilIcon className="w-4 h-4"/></button>
                            <button onClick={() => onDelete(lb.id)} style={{ touchAction: 'manipulation' }} className="text-muted hover:text-red-500 p-3 rounded-full transition-colors"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    </div>
                )) : (
                    <p className="text-muted text-sm text-center py-4">Tiada buku log. Cipta satu di bawah.</p>
                )}
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 border-t border-slate-200 space-y-4">
          <h3 className="font-semibold">{editingId ? 'Edit Nama Buku Log' : 'Cipta Buku Log Baru'}</h3>
            <div className="relative">
                <BookIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input 
                    type="text" 
                    placeholder="Contoh: Kereta Proton X50" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-input-bg border border-input-border text-text-primary rounded-lg pl-10 pr-4 py-2.5 focus:ring-primary focus:border-primary"
                    autoFocus={!editingId}
                />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
              {editingId && (
                <button type="button" onClick={handleCancelEdit} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-text-primary font-semibold">Batal</button>
              )}
              <button type="submit" className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-focus font-semibold text-white shadow-lg">{editingId ? 'Kemas Kini' : 'Cipta'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default LogbookManagerModal;
