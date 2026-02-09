import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const API = '/api';

export default function App() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = () => {
    fetch(`${API}/files`)
      .then((r) => r.json())
      .then(setFiles)
      .catch((e) => setError(e.message));
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
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Fichiers</h2>
          <button type="button" className="btn-refresh" onClick={fetchFiles} title="Actualiser la liste">
            Actualiser
          </button>
        </div>
        <ul className="file-list">
          {files.length === 0 && !error && (
            <li style={{ padding: '0.5rem 1rem', color: 'var(--muted)' }}>
              Aucun fichier .md dans le dossier files
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
