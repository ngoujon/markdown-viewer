import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const API = '/api';

export default function App() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
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
          // Fallback : le viewer PDF peut ne pas déclencher onload
          setTimeout(doPrint, 1500);
        } else {
          URL.revokeObjectURL(url);
          setError('Autorisez les pop-ups pour ouvrir l\'impression PDF.');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setPdfLoading(false));
  };

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
        <div className="toolbar">
          <button
            type="button"
            onClick={handlePrint}
            disabled={!currentPath || pdfLoading}
            title="Décochez « En-têtes et pieds de page » dans la fenêtre d'impression pour ne pas afficher l'URL, la date et les numéros de page."
          >
            {pdfLoading ? 'Préparation…' : 'Imprimer'}
          </button>
          <span className="toolbar-note">
            Dans la fenêtre d'impression, décochez « En-têtes et pieds de page » si vous ne voulez pas l'URL, la date ou les numéros de page.
          </span>
        </div>
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
