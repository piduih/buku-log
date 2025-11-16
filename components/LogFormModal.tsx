import React, { useState, useEffect } from 'react';
import { Logbook, LogEntry, EntryType } from '../types';
import { BookIcon, CalendarIcon, ClockIcon, DollarSignIcon, FileTextIcon, ImageIcon, XIcon } from './Icons';

interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: Omit<LogEntry, 'id'>, id?: string) => void;
  logbooks: Logbook[];
  entryToEdit?: LogEntry | null;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const LogFormModal: React.FC<LogFormModalProps> = ({ isOpen, onClose, onSubmit, logbooks, entryToEdit }) => {
  const [logbookId, setLogbookId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0,5));
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [attachmentPreview, setAttachmentPreview] = useState<string | undefined>(undefined);
  const [entryType, setEntryType] = useState<EntryType>('expense');

  const isEditing = !!entryToEdit;

  const resetForm = () => {
    setLogbookId(logbooks.length > 0 ? logbooks[0].id : '');
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0,5));
    setCost('');
    setNotes('');
    setAttachment(undefined);
    setAttachmentPreview(undefined);
    setEntryType('expense');
  }

  useEffect(() => {
    if (isOpen) {
        if (entryToEdit) {
            setLogbookId(entryToEdit.logbookId);
            setTitle(entryToEdit.title);
            setDate(entryToEdit.date);
            setTime(entryToEdit.time);
            setCost(String(entryToEdit.cost));
            setNotes(entryToEdit.notes || '');
            setAttachment(entryToEdit.attachment);
            setAttachmentPreview(entryToEdit.attachment);
            setEntryType((entryToEdit as any).type || 'expense');
        } else {
            resetForm();
        }
    }
  }, [isOpen, entryToEdit, logbooks]);

  const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachmentPreview(URL.createObjectURL(file));
      const base64 = await fileToBase64(file);
      setAttachment(base64);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !cost || !logbookId) {
        alert("Sila isi semua medan yang diperlukan (Buku Log, Tajuk, Kos).");
        return;
    }
    onSubmit({
      logbookId,
      title,
      date,
      time,
      cost: parseFloat(cost),
      type: entryType,
      notes,
      attachment,
    }, entryToEdit?.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-surface w-full sm:max-w-lg rounded-xl shadow-2xl max-h-[90vh] flex flex-col h-full sm:h-auto">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Rekod' : 'Tambah Rekod Baru'}</h2>
          <button onClick={onClose} className="text-muted hover:text-text-primary"><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div className="relative">
                <BookIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <select value={logbookId} onChange={(e) => setLogbookId(e.target.value)} required className="w-full bg-input-bg border border-input-border text-text-primary rounded-lg pl-10 pr-4 py-2.5 focus:ring-primary focus:border-primary">
                    <option value="" disabled>Pilih Buku Log</option>
                    {logbooks.map(lb => <option key={lb.id} value={lb.id}>{lb.name}</option>)}
                </select>
            </div>
            <div className="relative">
                <FileTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input type="text" placeholder="Tajuk / Perkara" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-input-bg border border-input-border text-text-primary rounded-lg pl-10 pr-4 py-2.5 focus:ring-primary focus:border-primary"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full bg-input-bg border border-input-border text-text-primary rounded-lg pl-10 pr-4 py-2.5 focus:ring-primary focus:border-primary" />
                </div>
                <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-full bg-input-bg border border-input-border text-text-primary rounded-lg pl-10 pr-4 py-2.5 focus:ring-primary focus:border-primary" />
                </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <label className={`px-3 py-1 rounded-full cursor-pointer ${entryType === 'expense' ? 'bg-red-100 border border-red-200 text-red-700' : 'bg-surface'}`}>
                  <input type="radio" name="entryType" value="expense" checked={entryType === 'expense'} onChange={() => setEntryType('expense')} className="hidden" />
                  <span className="text-sm font-medium">Perbelanjaan</span>
                </label>
                <label className={`px-3 py-1 rounded-full cursor-pointer ${entryType === 'income' ? 'bg-green-100 border border-green-200 text-green-700' : 'bg-surface'}`}>
                  <input type="radio" name="entryType" value="income" checked={entryType === 'income'} onChange={() => setEntryType('income')} className="hidden" />
                  <span className="text-sm font-medium">Pendapatan</span>
                </label>
            </div>
            <div className="relative">
                <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input type="number" placeholder="Kos (RM)" value={cost} onChange={(e) => setCost(e.target.value)} required min="0" step="0.01" className="w-full bg-input-bg border border-input-border text-text-primary rounded-lg pl-10 pr-4 py-2.5 focus:ring-primary focus:border-primary" />
            </div>
            <textarea placeholder="Catatan / Nota (Pilihan)" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-input-bg border border-input-border text-text-primary rounded-lg px-4 py-2 focus:ring-primary focus:border-primary h-24" />
            
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text-secondary cursor-pointer">
                    <ImageIcon className="w-5 h-5 text-muted" />
                    <span>Lampiran (Resit, Gambar, dll.)</span>
                    <input type="file" accept="image/*" onChange={handleAttachmentChange} className="hidden" />
                </label>
                {attachmentPreview && <img src={attachmentPreview} alt="Preview" className="mt-2 rounded-lg max-h-40 w-full object-cover" />}
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-text-primary font-semibold">Batal</button>
              <button type="submit" className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-focus font-semibold text-white shadow-lg">{isEditing ? 'Kemas Kini' : 'Simpan'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default LogFormModal;