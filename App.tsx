import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Logbook, LogEntry } from './types';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';
import LogFormModal from './components/LogFormModal';
import LogbookManagerModal from './components/LogbookManagerModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import { HomeIcon, HistoryIcon, PlusIcon, BookIcon, TagIcon, DownloadIcon } from './components/Icons';
import Toast from './components/Toast';
import { useFileSystemStorage } from './hooks/useFileSystemStorage';

type View = 'dashboard' | 'history';

const App: React.FC = () => {
  const [logbooks, setLogbooks] = useLocalStorage<Logbook[]>('logbooks', []);
  const [entries, setEntries] = useLocalStorage<LogEntry[]>('logEntries', []);
  // theme removed; application now uses single light theme
  
  const [view, setView] = useState<View>('dashboard');
  const [isLogFormOpen, setIsLogFormOpen] = useState(false);
  const [isLogbookManagerOpen, setIsLogbookManagerOpen] = useState(false);
  const [selectedLogbookId, setSelectedLogbookId] = useState<string | 'all'>('all');
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  
  const [itemToDelete, setItemToDelete] = useState<{id: string; type: 'entry' | 'logbook'} | null>(null);

  
  useEffect(() => {
    if (logbooks.length === 0 && entries.length === 0) {
      setIsLogbookManagerOpen(true);
    }
  }, []);


  const handleAddLogbook = (name: string) => {
    const newLogbook: Logbook = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    };
    setLogbooks(prev => [...prev, newLogbook].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleUpdateLogbook = (id: string, name: string) => {
    setLogbooks(prev => prev.map(lb => lb.id === id ? {...lb, name} : lb).sort((a,b) => a.name.localeCompare(b.name)));
  };
  
  const handleDeleteLogbook = (id: string) => {
    // Also delete associated entries
    setEntries(prev => prev.filter(entry => entry.logbookId !== id));
    setLogbooks(prev => prev.filter(lb => lb.id !== id));
    if (selectedLogbookId === id) {
        setSelectedLogbookId('all');
    }
  };

  const handleSaveEntry = (entryData: Omit<LogEntry, 'id'>, id?: string) => {
    if (id) {
      // Update existing entry
      setEntries(prev => prev.map(e => e.id === id ? { ...entryData, id } : e));
    } else {
      // Create new entry
      const newEntry: LogEntry = {
        id: crypto.randomUUID(),
        ...entryData,
      };
      setEntries(prev => [...prev, newEntry]);
    }
    setEditingEntry(null);
  };

  // Export/Import JSON for local persistence
  const exportAllData = () => {
    const payload = { logbooks, entries };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `buku-log-pak-long-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importAllData = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.logbooks) && Array.isArray(parsed.entries)) {
        setLogbooks(parsed.logbooks);
        // Ensure legacy entries without `type` default to 'expense'
        setEntries(parsed.entries.map((e: any) => ({ ...e, type: e.type || 'expense' })));
        alert('Data berjaya diimport.');
      } else {
        alert('Fail JSON tidak mengandungi struktur yang betul.');
      }
    } catch (e) {
      console.error(e);
      alert('Terdapat masalah semasa mengimport fail. Sila semak format fail.');
    }
  };
  
  const handleStartEdit = (entry: LogEntry) => {
    setEditingEntry(entry);
    setIsLogFormOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'entry') {
        setEntries(prev => prev.filter(entry => entry.id !== itemToDelete.id));
      } else if (itemToDelete.type === 'logbook') {
        handleDeleteLogbook(itemToDelete.id);
      }
      setItemToDelete(null);
    }
  };

  // File System Access API (optional) — saves handle in IndexedDB
  const { isSupported: fsSupported, attachFile, loadFromPicker, saveToFile, tryLoadSavedHandle, fileHandle } = useFileSystemStorage();
  const [autoSave, setAutoSave] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(60); // seconds
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{id:string;message:string;type?:'error'|'success'|'info'}>>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  // If we have a handle saved, automatically load once (permission permitting)
  useEffect(() => {
    (async () => {
      if (fsSupported) {
        const saved = await tryLoadSavedHandle();
        if (saved) {
          // If there is a saved handle, read its contents and populate stores
          try {
            const file = await saved.getFile();
            const text = await file.text();
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed.logbooks)) setLogbooks(parsed.logbooks);
              if (Array.isArray(parsed.entries)) setEntries(parsed.entries.map((e: any) => ({ ...e, type: e.type || 'expense' })));
          } catch (e) {
            console.warn('Could not load file from saved handle', e);
          }
        }
      }
    })();
  }, []);

  useEffect(() => {
    const onLine = () => setIsOnline(true);
    const offLine = () => setIsOnline(false);
    window.addEventListener('online', onLine);
    window.addEventListener('offline', offLine);
    return () => { window.removeEventListener('online', onLine); window.removeEventListener('offline', offLine); };
  }, []);

  useEffect(() => {
    const handler = () => setCanInstall(true);
    window.addEventListener('appcaninstall', handler);
    return () => window.removeEventListener('appcaninstall', handler);
  }, []);

  

  // Autosave background effect
  useEffect(() => {
    if (!autoSave || !fsSupported || !fileHandle) return;
    const intervalMs = Math.max(10, autoSaveInterval) * 1000;
    let mounted = true;
    const id = setInterval(async () => {
      try {
        const ok = await saveToFile({ logbooks, entries }, fileHandle);
        if (ok && mounted) {
          const time = new Date().toISOString();
          setLastSaved(time);
        }
      } catch (e) {
        console.error('Autosave failed', e);
        if (mounted) showToast('error', 'Autosave failed (offline or permission).');
      }
    }, intervalMs);
    return () => { mounted = false; clearInterval(id); };
  }, [autoSave, autoSaveInterval, fsSupported, fileHandle, logbooks, entries, saveToFile]);

  const showToast = React.useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
  }, [setToasts]);

  const removeToast = React.useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), [setToasts]);
  
  const handleCloseLogForm = () => {
    setIsLogFormOpen(false);
    setEditingEntry(null);
  }

  const NavButton: React.FC<{
    targetView: View;
    icon: React.ReactNode;
    label: string;
  }> = ({ targetView, icon, label }) => (
    <button
      onClick={() => setView(targetView)}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 gap-1 pt-2 ${
        view === targetView ? 'text-primary' : 'text-muted hover:text-text-primary'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-base flex flex-col font-sans">
      <header className="bg-surface sticky top-0 z-10 shadow-sm border-b border-slate-200 p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <BookIcon className="w-7 h-7 text-primary"/>
            <h1 className="text-lg sm:text-xl font-bold text-text-primary">Buku Log Pak Long</h1>
        </div>
        <div className="flex items-center gap-2">
            {/* Dark mode removed; app uses a single light theme */}
            <div className="hidden sm:flex items-center gap-2">
            <button 
                onClick={() => setIsLogbookManagerOpen(true)}
                className="flex items-center gap-1.5 text-sm bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
            >
                <TagIcon className="w-4 h-4"/>
                <span>Buku Log</span>
            </button>
            <button onClick={exportAllData} className="text-muted p-2 rounded-lg hover:bg-slate-100" title="Export JSON">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
            </button>
            <label className="text-muted p-2 rounded-lg hover:bg-slate-100 cursor-pointer" title="Import JSON">
              <input onChange={(e) => importAllData(e.target.files ? e.target.files[0] : null)} type="file" accept="application/json" className="hidden" />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </label>
            {fsSupported && (
              <>
                <button onClick={async () => {
                  const parsed = await loadFromPicker();
                  if (parsed?.logbooks) setLogbooks(parsed.logbooks);
                  if (parsed?.entries) setEntries(parsed.entries);
                  if (parsed) showToast('success', 'File loaded successfully.');
                }} className="text-muted p-2 rounded-lg hover:bg-slate-100" title="Attach/Load JSON file">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                </button>
                <button onClick={async () => {
                    const ok = await saveToFile({ logbooks, entries });
                    if (ok) {
                      setLastSaved(new Date().toISOString());
                      showToast('success', 'Saved to file.');
                    } else {
                      showToast('error', 'Save to file failed.');
                    }
                  }} className="text-muted p-2 rounded-lg hover:bg-slate-100" title="Save to attached file">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
                </button>
                <div className="flex items-center gap-2">
                  <label title="Auto-save to attached file" className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface">
                    <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
                    <span className="text-sm">Auto-save</span>
                  </label>
                  <input type="number" value={autoSaveInterval} onChange={e => setAutoSaveInterval(Number(e.target.value) || 60)} className="w-20 px-2 py-1 rounded-md border" title="Interval (seconds)" />
                </div>
                <div className="ml-4 text-sm text-muted">
                  {fileHandle ? <span>Attached: {fileHandle.name}</span> : <span>No file attached</span>}
                  &nbsp;•&nbsp;
                  {lastSaved ? <span>Last saved: {new Date(lastSaved).toLocaleString()}</span> : <span>Never saved</span>}
                  {autoSave && !isOnline && <span className="ml-2 text-yellow-600"> (Autosave paused - offline)</span>}
                </div>
              </>
            )}
            </div>

            {/* Mobile menu for header actions (kept minimal) */}
            <div className="sm:hidden relative">
              <button onClick={() => setIsHeaderMenuOpen(prev => !prev)} className="p-2 rounded-md hover:bg-slate-100">
                <span className="text-lg">⋯</span>
              </button>
              {isHeaderMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface shadow-md rounded-md border border-slate-200 p-2">
                  <button onClick={() => { setIsLogbookManagerOpen(true); setIsHeaderMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Urus Buku Log</button>
                  <button onClick={() => { exportAllData(); setIsHeaderMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Export JSON</button>
                  <label className="w-full text-left px-3 py-2 rounded block hover:bg-slate-50 cursor-pointer">
                    <input onChange={(e) => { importAllData(e.target.files ? e.target.files[0] : null); setIsHeaderMenuOpen(false); }} type="file" accept="application/json" className="hidden" />
                    Import JSON
                  </label>
                  {fsSupported && (
                    <>
                      <button onClick={async () => { const parsed = await loadFromPicker(); if (parsed?.logbooks) setLogbooks(parsed.logbooks); if (parsed?.entries) setEntries(parsed.entries); showToast('success', 'File loaded successfully.'); setIsHeaderMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Attach / Load</button>
                      <button onClick={async () => { const ok = await saveToFile({ logbooks, entries }); if (ok) { setLastSaved(new Date().toISOString()); showToast('success', 'Saved to file.'); } else { showToast('error', 'Save to file failed.'); } setIsHeaderMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Save to File</button>
                      {canInstall && (
                        <button onClick={() => { window.dispatchEvent(new CustomEvent('app-install-request')); setIsHeaderMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Pasang Aplikasi</button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
        </div>
      </header>

      <main className="flex-grow pb-24">
        {view === 'dashboard' && <Dashboard entries={entries} logbooks={logbooks} />}
        {view === 'history' && (
          <HistoryView 
            entries={entries} 
            logbooks={logbooks} 
            selectedLogbookId={selectedLogbookId} 
            onSelectLogbookId={setSelectedLogbookId}
            onEditEntry={handleStartEdit}
            onDeleteEntry={(id) => setItemToDelete({id, type: 'entry'})}
          />
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="relative bg-surface h-[70px] border-t border-slate-200 flex justify-around items-center">
            <NavButton targetView="dashboard" icon={<HomeIcon />} label="Dashboard" />
            
            <div className="absolute left-1/2 -translate-x-1/2 -top-7">
                <button
                    onClick={() => {
                        if (logbooks.length === 0) {
                            alert("Sila cipta Buku Log terlebih dahulu.");
                            setIsLogbookManagerOpen(true);
                        } else {
                            setIsLogFormOpen(true);
                        }
                    }}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/40 hover:bg-primary-focus transition-transform duration-200 active:scale-90"
                    aria-label="Tambah Rekod Baru"
                >
                    <PlusIcon className="w-8 h-8" strokeWidth={2.5}/>
                </button>
            </div>

            {/* Study module removed */}
            <NavButton targetView="history" icon={<HistoryIcon />} label="Sejarah" />
        </div>
      </div>

      <LogFormModal 
        isOpen={isLogFormOpen}
        onClose={handleCloseLogForm}
        onSubmit={handleSaveEntry}
        logbooks={logbooks}
        entryToEdit={editingEntry}
      />
      <LogbookManagerModal 
        isOpen={isLogbookManagerOpen}
        onClose={() => setIsLogbookManagerOpen(false)}
        logbooks={logbooks}
        onAdd={handleAddLogbook}
        onUpdate={handleUpdateLogbook}
        onDelete={(id) => setItemToDelete({id, type: 'logbook'})}
      />
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={itemToDelete?.type === 'entry' ? "Padam Rekod" : "Padam Buku Log"}
        message={
            itemToDelete?.type === 'entry' 
            ? "Adakah anda pasti mahu memadam rekod ini? Tindakan ini tidak boleh dibatalkan."
            : "Adakah anda pasti? Memadam buku log ini juga akan memadam semua rekod di dalamnya secara kekal."
        }
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;