import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const API = '/api';

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

  const fetchFiles = () => {
    fetch(`${API}/files`)
      .then((r) => r.json())
      .then(setFiles)
      .catch((e) => setError(e.message));
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

  useEffect(() => {
    fetchFiles();
  }, []);

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

  return (
    <div className="app">
      <aside
        className={`sidebar ${isDragging ? 'sidebar--drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="sidebar-header">
          <h2>Fichiers</h2>
          <button type="button" className="btn-refresh" onClick={fetchFiles} title="Actualiser la liste">
            Actualiser
          </button>
        </div>
        {uploadError && (
          <div className="sidebar-upload-error">{uploadError}</div>
        )}
        {uploading && (
          <div className="sidebar-uploading">Copie en cours…</div>
        )}
        <ul className="file-list">
          {files.length === 0 && !error && !uploading && (
            <li className="file-list-empty">
              Aucun fichier. Glissez-déposez des fichiers .txt ou .md ici.
            </li>
          )}
          {files.map((f) => (
            <li key={f.path}>
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
            </li>
          ))}
        </ul>
      </aside>
      <div className="viewer-wrap">
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
            <div className="empty">Sélectionnez un fichier dans la liste</div>
          )}
        </div>
      </div>
    </div>
  );
}
