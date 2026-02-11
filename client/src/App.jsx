import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const API = '/api';

function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant = 'danger' }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={`modal-dialog modal--${variant}`} onClick={(e) => e.stopPropagation()}>
        <h2 id="modal-title" className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn--cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="modal-btn modal-btn--confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function isAllowedFile(name) {
  const n = name.toLowerCase();
  return n.endsWith('.md') || n.endsWith('.txt');
}

export default function App() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [trashFiles, setTrashFiles] = useState([]);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchFiles = () => {
    fetch(`${API}/files`)
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) {
          let err = {};
          try {
            if (text) err = JSON.parse(text);
          } catch {}
          throw new Error(err.error || `Erreur ${r.status}`);
        }
        return text ? JSON.parse(text) : [];
      })
      .then(setFiles)
      .catch((e) => setError(e.message));
  };

  const fetchTrash = () => {
    fetch(`${API}/trash`)
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) return [];
        return text ? JSON.parse(text) : [];
      })
      .then(setTrashFiles)
      .catch(() => setTrashFiles([]));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
  };

  const handleDeleteClick = (filePath, e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(filePath);
  };

  const handleDeleteConfirm = async () => {
    const filePath = confirmDelete;
    if (!filePath) return;
    setConfirmDelete(null);
    try {
      const r = await fetch(`${API}/files/${encodeURIComponent(filePath)}`, { method: 'DELETE' });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        setUploadError(data.error || 'Impossible de supprimer le fichier.');
        return;
      }
      if (currentPath === filePath) setCurrentPath(null);
      setUploadError(null);
      fetchFiles();
      fetchTrash();
    } catch (err) {
      setUploadError(err.message || 'Erreur réseau.');
    }
  };

  const handlePrint = () => {
    if (!currentPath) return;
    setPdfLoading(true);
    setError(null);
    fetch(`${API}/export-pdf?path=${encodeURIComponent(currentPath)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Export impossible');
        return r.arrayBuffer();
      })
      .then((arrayBuffer) => {
        if (arrayBuffer.byteLength === 0) throw new Error('PDF vide');
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank', 'noopener');
        if (printWindow) {
          let printed = false;
          const doPrint = () => {
            if (printed) return;
            printed = true;
            printWindow.print();
            printWindow.onafterprint = () => {
              printWindow.close();
              URL.revokeObjectURL(url);
            };
          };
          printWindow.onload = doPrint;
          setTimeout(doPrint, 1500);
        } else {
          URL.revokeObjectURL(url);
          setError('Autorisez les pop-ups pour ouvrir l\'impression PDF.');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setPdfLoading(false));
  };

  const handleRestore = async (trashPath) => {
    try {
      const r = await fetch(`${API}/trash/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: trashPath }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setUploadError(data.error || 'Impossible de restaurer le fichier.');
        return;
      }
      setUploadError(null);
      fetchFiles();
      fetchTrash();
      setCurrentPath(data.path);
      setShowTrashModal(false);
    } catch (err) {
      setUploadError(err.message || 'Erreur réseau.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError(null);
    const items = Array.from(e.dataTransfer.files);
    const toUpload = items.filter((f) => isAllowedFile(f.name));
    if (toUpload.length === 0) {
      setUploadError('Seuls les fichiers .txt et .md sont acceptés.');
      return;
    }
    const form = new FormData();
    toUpload.forEach((f) => form.append('files', f));
    setUploading(true);
    try {
      const r = await fetch(`${API}/upload`, { method: 'POST', body: form });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setUploadError(data.error || 'Erreur lors de la copie des fichiers.');
        return;
      }
      fetchFiles();
    } catch (err) {
      setUploadError(err.message || 'Erreur réseau.');
    } finally {
      setUploading(false);
    }
  };

  const refreshAll = () => {
    fetchFiles();
    fetchTrash();
  };

  useEffect(() => {
    fetchFiles();
    fetchTrash();
  }, []);

  useEffect(() => {
    if (!showTrashModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowTrashModal(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showTrashModal]);

  useEffect(() => {
    if (!currentPath) {
      setContent('');
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API}/files/${encodeURIComponent(currentPath)}`)
      .then((r) => {
        if (!r.ok) throw new Error('Fichier introuvable');
        return r.text();
      })
      .then(setContent)
      .catch((e) => {
        setError(e.message);
        setContent('');
      })
      .finally(() => setLoading(false));
  }, [currentPath]);

  const currentFile = files.find((f) => f.path === currentPath);
  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '—';
      const day = d.getDate();
      const month = d.toLocaleDateString('fr-FR', { month: 'long' });
      const year = d.getFullYear();
      const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${day} ${month} ${year} à ${time}`;
    } catch {
      return '—';
    }
  };

  const formatSize = (bytes) => {
    if (bytes == null || bytes === undefined) return '—';
    const n = Number(bytes);
    if (Number.isNaN(n) || n < 0) return '—';
    if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} Mo`;
    if (n >= 1024) return `${(n / 1024).toFixed(2)} Ko`;
    return `${n} octet${n !== 1 ? 's' : ''}`;
  };

  const kpis = {
    totalFiles: files.length,
    totalSize: files.reduce((acc, f) => acc + (f.size || 0), 0),
    mdCount: files.filter((f) => f.name?.toLowerCase().endsWith('.md')).length,
    txtCount: files.filter((f) => f.name?.toLowerCase().endsWith('.txt')).length,
    trashCount: trashFiles.length,
  };

  return (
    <div className="app">
      <aside
        className={`sidebar ${isDragging ? 'sidebar--drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <a
          href="#"
          className={`sidebar-nav-link ${!currentPath ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setCurrentPath(null);
          }}
        >
          Vue d'ensemble
        </a>
        <div className="sidebar-header">
          <h2>Fichiers</h2>
          <button type="button" className="btn-refresh" onClick={refreshAll} title="Actualiser la liste">
            Actualiser
          </button>
        </div>
        {uploadError && (
          <div className="sidebar-upload-error">{uploadError}</div>
        )}
        {uploading && (
          <div className="sidebar-uploading">Copie en cours…</div>
        )}
        <ul className="file-list sidebar-file-list">
          {files.length === 0 && !error && !uploading && (
            <li className="file-list-empty">
              Aucun fichier. Glissez-déposez des fichiers .txt ou .md ici.
            </li>
          )}
          {files.map((f) => (
            <li key={f.path} className="file-list-item">
              <a
                href="#"
                className={currentPath === f.path ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPath(f.path);
                }}
              >
                {f.name}
              </a>
              <button
                type="button"
                className="file-list-delete"
                title="Supprimer ce fichier"
                onClick={(e) => handleDeleteClick(f.path, e)}
                aria-label={`Supprimer ${f.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="sidebar-trash-btn"
          onClick={() => setShowTrashModal(true)}
          title="Voir les fichiers supprimés"
        >
          🗑 Corbeille {trashFiles.length > 0 && `(${trashFiles.length})`}
        </button>
      </aside>
      <div className="viewer-wrap">
        {currentPath && (
          <header className="doc-header">
            <div className="doc-header-left">
              <button
                type="button"
                className="doc-header-btn-print"
                onClick={handlePrint}
                disabled={pdfLoading}
                title="Imprimer ou enregistrer en PDF"
              >
                {pdfLoading ? 'Préparation…' : 'Imprimer'}
              </button>
            </div>
            <span className="doc-header-name">{currentFile?.name ?? currentPath}</span>
            <span className="doc-header-meta">
              <span className="doc-header-label">Taille</span>{' '}
              <span className="doc-header-value">{formatSize(currentFile?.size)}</span>
              <span className="doc-header-sep"> · </span>
              <span className="doc-header-label">Créé le</span>{' '}
              <span className="doc-header-value">{formatDate(currentFile?.createdAt)}</span>
              <span className="doc-header-sep"> · </span>
              <span className="doc-header-label">Modifié le</span>{' '}
              <span className="doc-header-value">{formatDate(currentFile?.modifiedAt)}</span>
            </span>
          </header>
        )}
        <div className="viewer">
          {error && <div className="error">{error}</div>}
          {loading && <div className="empty">Chargement…</div>}
          {!loading && currentPath && !error && (
            <div className="page">
              <div className="markdown">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          )}
          {!currentPath && !loading && (
            <div className="overview">
              <h1 className="overview-title">Vue d'ensemble</h1>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <span className="kpi-value">{kpis.totalFiles}</span>
                  <span className="kpi-label">Fichiers</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-value">{formatSize(kpis.totalSize)}</span>
                  <span className="kpi-label">Taille totale</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-value">{kpis.mdCount}</span>
                  <span className="kpi-label">Fichiers .md</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-value">{kpis.txtCount}</span>
                  <span className="kpi-label">Fichiers .txt</span>
                </div>
                <div className="kpi-card">
                  <span className="kpi-value">{kpis.trashCount}</span>
                  <span className="kpi-label">Dans la corbeille</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={!!confirmDelete}
        title="Déplacer dans la corbeille"
        message={confirmDelete ? `Déplacer « ${confirmDelete.split('/').pop()} » dans la corbeille ? Vous pourrez le restaurer plus tard.` : ''}
        confirmLabel="Déplacer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />
      {showTrashModal && (
        <div className="modal-overlay" onClick={() => setShowTrashModal(false)} role="dialog" aria-modal="true" aria-labelledby="trash-modal-title">
          <div className="modal-dialog modal--trash" onClick={(e) => e.stopPropagation()}>
            <h2 id="trash-modal-title" className="modal-title">Corbeille</h2>
            <p className="modal-message">Fichiers supprimés. Vous pouvez les restaurer.</p>
            {trashFiles.length === 0 ? (
              <p className="trash-empty">Aucun fichier dans la corbeille.</p>
            ) : (
              <ul className="trash-modal-list">
                {trashFiles.map((f) => (
                  <li key={f.path} className="trash-modal-item">
                    <span className="trash-modal-name">{f.name}</span>
                    <button
                      type="button"
                      className="file-list-restore"
                      onClick={() => handleRestore(f.path)}
                      title="Restaurer"
                    >
                      ↩ Restaurer
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-actions">
              <button type="button" className="modal-btn modal-btn--cancel" onClick={() => setShowTrashModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
