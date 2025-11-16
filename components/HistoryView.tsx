import React, { useState } from 'react';
import { LogEntry, Logbook } from '../types';
import { BookIcon, CalendarIcon, ClockIcon, DollarSignIcon, FileTextIcon, ImageIcon, PencilIcon, SearchIcon, TrashIcon } from './Icons';

interface HistoryViewProps {
  entries: LogEntry[];
  logbooks: Logbook[];
  selectedLogbookId: string | 'all';
  onSelectLogbookId: (id: string | 'all') => void;
  onEditEntry: (entry: LogEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ms-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const HistoryView: React.FC<HistoryViewProps> = ({ entries, logbooks, selectedLogbookId, onSelectLogbookId, onEditEntry, onDeleteEntry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');

  const filteredEntries = React.useMemo(() => {
    let filtered = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.time.localeCompare(a.time));

    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(entry => 
            entry.title.toLowerCase().includes(lowerCaseQuery) ||
            (entry.notes && entry.notes.toLowerCase().includes(lowerCaseQuery))
        );
    }
    
    if (startDate) {
        filtered = filtered.filter(entry => new Date(entry.date) >= new Date(startDate));
    }

    if (endDate) {
        filtered = filtered.filter(entry => new Date(entry.date) <= new Date(endDate));
    }

        if (selectedLogbookId !== 'all') {
          filtered = filtered.filter(entry => entry.logbookId === selectedLogbookId);
        }
        if (typeFilter !== 'all') {
          filtered = filtered.filter(entry => (entry.type || 'expense') === typeFilter);
        }
    
    return filtered;
  }, [entries, selectedLogbookId, searchQuery, startDate, endDate]);

  const logbookMap = React.useMemo(() => new Map(logbooks.map(lb => [lb.id, lb.name])), [logbooks]);

  const totalExpense = React.useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + ((entry.type === 'income') ? 0 : entry.cost), 0);
  }, [filteredEntries]);

  const totalIncome = React.useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + ((entry.type === 'income') ? entry.cost : 0), 0);
  }, [filteredEntries]);

  const net = totalIncome - totalExpense;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="space-y-4">
        <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input 
                type="text" 
                placeholder="Cari mengikut tajuk atau nota..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-input-bg border border-input-border rounded-lg pl-10 pr-4 py-2.5 text-text-primary focus:ring-primary focus:border-primary"
            />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <select
            value={selectedLogbookId}
            onChange={(e) => onSelectLogbookId(e.target.value)}
            className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2.5 text-text-primary focus:ring-primary focus:border-primary md:col-span-2"
            >
            <option value="all">Semua Buku Log</option>
            {logbooks.map(lb => (
                <option key={lb.id} value={lb.id}>{lb.name}</option>
            ))}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2.5 text-text-primary focus:ring-primary focus:border-primary">
              <option value="all">Semua Jenis</option>
              <option value="expense">Perbelanjaan</option>
              <option value="income">Pendapatan</option>
            </select>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2.5 text-text-primary focus:ring-primary focus:border-primary" />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-input-bg border border-input-border rounded-lg px-3 py-2.5 text-text-primary focus:ring-primary focus:border-primary" />
        </div>
        <div className="bg-surface rounded-lg px-4 py-2 text-center border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <span className="text-muted">Pendapatan</span>
            <div className="font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </div>
          <div>
            <span className="text-muted">Perbelanjaan</span>
            <div className="font-bold text-red-600">{formatCurrency(totalExpense)}</div>
          </div>
          <div>
            <span className="text-muted">Baki (Pendapatan − Perbelanjaan)</span>
            <div className={`font-bold ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(net)}</div>
          </div>
        </div>
      </div>

      {filteredEntries.length > 0 ? (
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="bg-surface rounded-lg p-5 shadow-md border border-slate-200">
              <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-text-primary">{entry.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${entry.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{entry.type === 'income' ? 'Pendapatan' : 'Perbelanjaan'}</span>
                    </div>
                    <p className="text-sm text-primary font-semibold flex items-center gap-1.5 pt-1"><BookIcon className="w-4 h-4" /> {logbookMap.get(entry.logbookId) || 'Tidak diketahui'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className={`font-bold text-xl whitespace-nowrap pl-4 ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(entry.cost)}</p>
                    <button onClick={() => onEditEntry(entry)} style={{ touchAction: 'manipulation' }} className="text-muted hover:text-primary p-3 rounded-full hover:bg-slate-100 transition-colors"><PencilIcon className="w-4 h-4"/></button>
                    <button onClick={() => onDeleteEntry(entry.id)} style={{ touchAction: 'manipulation' }} className="text-muted hover:text-red-500 p-3 rounded-full hover:bg-slate-100 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                  </div>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-secondary">
                  <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-muted"/> {formatDate(entry.date)}</div>
                  <div className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4 text-muted"/> {entry.time}</div>
              </div>
              {entry.notes && <p className="mt-3 text-sm text-text-secondary flex items-start gap-1.5"><FileTextIcon className="w-4 h-4 mt-0.5 shrink-0 text-muted"/> {entry.notes}</p>}
              {entry.attachment && (
                  <div className="mt-3">
                    <a href={entry.attachment} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <img src={entry.attachment} alt="Attachment" className="max-h-48 w-full object-cover rounded-md" />
                    </a>
                  </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookIcon className="w-16 h-16 mx-auto text-muted" />
          <h3 className="mt-4 text-xl font-semibold">Tiada Rekod</h3>
          <p className="mt-1 text-muted">Tiada rekod yang sepadan dengan tapisan anda.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryView;