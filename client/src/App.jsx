import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

function ArrowPathIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function PencilIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
    </svg>
  );
}

function ChevronLeftIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function Bars3Icon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function PrinterIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth={32} strokeLinejoin="round" className={className}>
      <path d="M384,368h24a40.12,40.12,0,0,0,40-40V168a40.12,40.12,0,0,0-40-40H104a40.12,40.12,0,0,0-40,40V328a40.12,40.12,0,0,0,40,40h24" />
      <rect x="128" y="240" width="256" height="208" rx="24.32" ry="24.32" />
      <path d="M384,128V104a40.12,40.12,0,0,0-40-40H168a40.12,40.12,0,0,0-40,40v24" />
      <circle cx="392" cy="184" r="24" fill="currentColor" />
    </svg>
  );
}

function ArrowDownTrayIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function SplitVerticalIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3h7.5v18h-7.5V3ZM13.75 3h6.5v18h-6.5V3" />
    </svg>
  );
}

function SplitHorizontalIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3.75h18v7.5H3v-7.5ZM3 13.75h18v6.5H3v-6.5Z" />
    </svg>
  );
}

function XMarkIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ArrowsPointingInIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
    </svg>
  );
}

const API = '/api';
const MINIMAP_STORAGE_KEY = 'markdown-viewer-minimap';
const SPLIT_MODE_STORAGE_KEY = 'markdown-viewer-split-mode';

/** Aucun lien : les liens markdown sont rendus comme du texte simple */
const markdownComponents = {
  a: ({ children }) => <span>{children}</span>,
};

function DocumentMinimap({ content, viewerRef, visible }) {
  const minimapRef = useRef(null);
  const [scale, setScale] = useState(0.1);
  const [contentWidth, setContentWidth] = useState(400);
  const [viewportStyle, setViewportStyle] = useState({});
  const isDraggingRef = useRef(false);

  const scrollToMinimapY = useCallback((minimapY) => {
    const viewer = viewerRef?.current;
    const minimap = minimapRef?.current;
    if (!viewer || !minimap) return;
    const rect = minimap.getBoundingClientRect();
    const y = minimapY - rect.top;
    const docHeight = viewer.scrollHeight;
    const docWidth = viewer.scrollWidth;
    const minimapWidth = minimap.clientWidth;
    const scaleX = minimapWidth / Math.max(docWidth, 1);
    const scaleY = minimap.clientHeight / docHeight;
    const s = Math.min(scaleX, scaleY, 1);
    const scaledHeight = docHeight * s;
    const contentY = (y / scaledHeight) * docHeight - viewer.clientHeight / 2;
    viewer.scrollTop = Math.max(0, contentY);
  }, [viewerRef]);

  const updateScaleAndViewport = useCallback(() => {
    const viewer = viewerRef?.current;
    const minimap = minimapRef?.current;
    if (!viewer || !minimap || !visible) return;

    // Utiliser les dimensions du viewer principal (document réel)
    const docHeight = viewer.scrollHeight;
    const docWidth = viewer.scrollWidth;
    const viewerHeight = viewer.clientHeight;
    const minimapWidth = minimap.clientWidth || 120;

    if (docHeight <= 0) return;
    const scaleY = viewerHeight / docHeight;
    const scaleX = minimapWidth / Math.max(docWidth, 1);
    const s = Math.min(scaleX, scaleY, 1);
    setScale(s);
    setContentWidth(docWidth);

    const scrollTop = viewer.scrollTop;
    const viewportHeight = viewer.clientHeight;
    const scaledDocHeight = docHeight * s;
    const viewportTop = (scrollTop / docHeight) * scaledDocHeight;
    const viewportH = (viewportHeight / docHeight) * scaledDocHeight;
    setViewportStyle({
      top: viewportTop,
      height: Math.max(viewportH, 20),
    });
  }, [viewerRef, visible]);

  useEffect(() => {
    if (!visible) return;
    updateScaleAndViewport();
    const viewer = viewerRef?.current;
    if (!viewer) return;
    const onScroll = () => updateScaleAndViewport();
    viewer.addEventListener('scroll', onScroll);
    const ro = new ResizeObserver(updateScaleAndViewport);
    ro.observe(viewer);
    return () => {
      viewer.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [visible, content, updateScaleAndViewport, viewerRef]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(updateScaleAndViewport, 200);
    return () => clearTimeout(timer);
  }, [visible, content, updateScaleAndViewport]);

  const handleMinimapMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    scrollToMinimapY(e.clientY);
  };

  useEffect(() => {
    if (!visible) return;
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      scrollToMinimapY(e.clientY);
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [visible, scrollToMinimapY]);

  if (!visible) return null;

  return (
    <div
      ref={minimapRef}
      className="minimap"
      onMouseDown={handleMinimapMouseDown}
      role="presentation"
      aria-hidden
    >
      <div className="minimap-content-wrapper">
        <div
          className="minimap-content viewer-mirror"
          style={{
            width: contentWidth,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <div className="page minimap-page">
            <div className="markdown">
              <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
      <div
        className="minimap-viewport"
        style={viewportStyle}
        aria-hidden
      />
    </div>
  );
}

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

function RenameFileModal({ open, value, onChange, onConfirm, onCancel, renaming }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    inputRef.current?.select();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const v = (value || '').trim();
        if (v) onConfirm();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, value, onConfirm, onCancel]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="rename-file-modal-title">
      <div className="modal-dialog modal--create" onClick={(e) => e.stopPropagation()}>
        <h2 id="rename-file-modal-title" className="modal-title">Renommer le fichier</h2>
        <p className="modal-message">Indiquez le nouveau nom. L&apos;extension sera conservée, les espaces seront remplacés par des underscores.</p>
        <div className="modal-create-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="modal-create-input"
            placeholder="ex. mon document"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Nouveau nom du fichier"
            disabled={renaming}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn--cancel" onClick={onCancel} disabled={renaming}>
            Annuler
          </button>
          <button
            type="button"
            className="modal-btn modal-btn--confirm modal-btn--create"
            onClick={() => (value || '').trim() && onConfirm()}
            disabled={renaming || !(value || '').trim()}
          >
            {renaming ? 'Renommage…' : 'Renommer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateFileModal({ open, value, onChange, onConfirm, onCancel, creating }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const v = (value || '').trim();
        if (v) onConfirm();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, value, onConfirm, onCancel]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="create-file-modal-title">
      <div className="modal-dialog modal--create" onClick={(e) => e.stopPropagation()}>
        <h2 id="create-file-modal-title" className="modal-title">Nouveau fichier</h2>
        <p className="modal-message">Indiquez le nom du fichier. L&apos;extension .md sera ajoutée automatiquement, les espaces seront remplacés par des underscores.</p>
        <div className="modal-create-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="modal-create-input"
            placeholder="ex. mon document"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Nom du fichier"
            disabled={creating}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn--cancel" onClick={onCancel} disabled={creating}>
            Annuler
          </button>
          <button
            type="button"
            className="modal-btn modal-btn--confirm modal-btn--create"
            onClick={() => (value || '').trim() && onConfirm()}
            disabled={creating || !(value || '').trim()}
          >
            {creating ? 'Création…' : 'Créer'}
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

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function useHighlightInDocument(containerRef, content, searchQuery) {
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const unwrapHighlights = () => {
      el.querySelectorAll('.doc-search-highlight-wrap').forEach((wrap) => {
        wrap.replaceWith(...wrap.childNodes);
      });
    };
    unwrapHighlights();
    const q = (searchQuery || '').trim();
    if (!q) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) textNodes.push(n);
    const regex = new RegExp(`(${escapeRegex(q)})`, 'gi');
    textNodes.forEach((node) => {
      const text = node.textContent || '';
      if (!regex.test(text)) return;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(text)) !== null) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
        const mark = document.createElement('mark');
        mark.className = 'doc-search-highlight';
        mark.textContent = m[1];
        fragment.appendChild(mark);
        lastIndex = m.index + m[1].length;
      }
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      const wrap = document.createElement('span');
      wrap.className = 'doc-search-highlight-wrap';
      wrap.appendChild(fragment);
      node.parentNode?.replaceChild(wrap, node);
    });
    return unwrapHighlights;
  }, [content, searchQuery]);
}

function DocumentPane({ path, files, minimapEnabled, onPrint, onDownloadPdf, pdfLoading, printError, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docSearchDebounced, setDocSearchDebounced] = useState('');
  const [docSearchIndex, setDocSearchIndex] = useState(0);
  const [docSearchCount, setDocSearchCount] = useState(0);
  const docSearchTimeoutRef = useRef(null);
  const viewerRef = useRef(null);
  const markdownContentRef = useRef(null);
  const currentFile = files.find((f) => f.path === path);

  const refreshContent = useCallback(() => {
    if (!path) return;
    setLoading(true);
    setError(null);
    fetch(`${API}/files/${encodeURIComponent(path)}`)
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
  }, [path]);

  useEffect(() => {
    if (!path) {
      setContent('');
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API}/files/${encodeURIComponent(path)}`)
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
  }, [path]);

  useEffect(() => {
    const q = docSearchQuery.trim();
    if (!q) {
      if (docSearchTimeoutRef.current) clearTimeout(docSearchTimeoutRef.current);
      setDocSearchDebounced('');
      return;
    }
    if (docSearchTimeoutRef.current) clearTimeout(docSearchTimeoutRef.current);
    docSearchTimeoutRef.current = setTimeout(() => setDocSearchDebounced(q), 2000);
    return () => {
      if (docSearchTimeoutRef.current) clearTimeout(docSearchTimeoutRef.current);
    };
  }, [docSearchQuery]);

  useHighlightInDocument(markdownContentRef, content, docSearchDebounced);

  useEffect(() => {
    if (!docSearchDebounced) {
      setDocSearchCount(0);
      return;
    }
    const el = markdownContentRef?.current;
    if (!el) return;
    const marks = el.querySelectorAll('.doc-search-highlight');
    setDocSearchCount(marks.length);
  }, [content, docSearchDebounced]);

  const scrollToDocSearchMatch = useCallback((index) => {
    const el = markdownContentRef?.current;
    if (!el) return;
    const marks = el.querySelectorAll('.doc-search-highlight');
    if (marks.length === 0) return;
    const i = ((index % marks.length) + marks.length) % marks.length;
    marks[i].scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!docSearchDebounced) return;
    scrollToDocSearchMatch(docSearchIndex);
  }, [docSearchIndex, docSearchDebounced, content, scrollToDocSearchMatch]);

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

  if (!path) return null;

  return (
    <div className="document-pane">
      <header className="doc-header">
        <div className="doc-header-left">
          <button
            type="button"
            className="doc-header-btn-icon"
            onClick={refreshContent}
            disabled={loading}
            title="Actualiser le contenu du fichier"
            aria-label="Actualiser le contenu du fichier"
          >
            <ArrowPathIcon className="doc-header-icon" />
          </button>
          <button
            type="button"
            className="doc-header-btn-icon doc-header-btn-print"
            onClick={() => onDownloadPdf(path)}
            disabled={pdfLoading}
            title="Télécharger le PDF"
            aria-label="Télécharger le PDF"
          >
            {pdfLoading ? (
              <ArrowPathIcon className="doc-header-icon doc-header-icon--spin" />
            ) : (
              <ArrowDownTrayIcon className="doc-header-icon" />
            )}
          </button>
          <button
            type="button"
            className="doc-header-btn-icon doc-header-btn-print"
            onClick={() => onPrint(path)}
            disabled={pdfLoading}
            title="Ouvrir dans un nouvel onglet pour imprimer"
            aria-label="Ouvrir le PDF pour imprimer"
          >
            {pdfLoading ? (
              <ArrowPathIcon className="doc-header-icon doc-header-icon--spin" />
            ) : (
              <PrinterIcon className="doc-header-icon" />
            )}
          </button>
          {printError && (
            <span className="doc-header-print-error">{printError}</span>
          )}
        </div>
        <span className="doc-header-name">{currentFile?.name ?? path}</span>
        <div className="doc-header-right">
          {onClose && (
            <button
              type="button"
              className="doc-header-close"
              onClick={onClose}
              title="Fermer"
              aria-label={`Fermer ${currentFile?.name ?? path}`}
            >
              <XMarkIcon className="doc-header-close-icon" />
            </button>
          )}
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
        </div>
      </header>
      {!loading && !error && (
        <div className="doc-search-bar">
          <div className="search-input-wrap">
            <input
              type="search"
              className="doc-search-input"
              placeholder="Rechercher dans ce document…"
              value={docSearchQuery}
              onChange={(e) => {
                setDocSearchQuery(e.target.value);
                setDocSearchIndex(0);
              }}
              aria-label="Rechercher dans le document"
            />
            {docSearchQuery.length > 0 && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setDocSearchQuery('');
                  setDocSearchIndex(0);
                }}
                title="Effacer la recherche"
                aria-label="Effacer la recherche"
              >
                ×
              </button>
            )}
          </div>
          {docSearchQuery.trim() && (
            <div className="doc-search-results">
              <span className="doc-search-count">
                {docSearchDebounced !== docSearchQuery.trim()
                  ? 'Recherche…'
                  : docSearchCount === 0
                    ? 'Aucun résultat'
                    : `${((docSearchIndex % docSearchCount) + docSearchCount) % docSearchCount + 1} / ${docSearchCount}`}
              </span>
              <div className="doc-search-nav">
                <button
                  type="button"
                  className="doc-search-btn"
                  onClick={() => setDocSearchIndex((i) => i - 1)}
                  disabled={docSearchCount === 0 || docSearchDebounced !== docSearchQuery.trim()}
                  title="Occurrence précédente"
                  aria-label="Occurrence précédente"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="doc-search-btn"
                  onClick={() => setDocSearchIndex((i) => i + 1)}
                  disabled={docSearchCount === 0 || docSearchDebounced !== docSearchQuery.trim()}
                  title="Occurrence suivante"
                  aria-label="Occurrence suivante"
                >
                  ↓
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="viewer-container document-pane-viewer">
        <div ref={viewerRef} className="viewer">
          {error && <div className="error">{error}</div>}
          {loading && <div className="empty">Chargement…</div>}
          {!loading && !error && (
            <div className="page">
              <div ref={markdownContentRef} className="markdown">
                <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
        {!loading && !error && (
          <DocumentMinimap
            content={content}
            viewerRef={viewerRef}
            visible={minimapEnabled}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [leftTabIndex, setLeftTabIndex] = useState(0);
  const [rightTabIndex, setRightTabIndex] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [createFileName, setCreateFileName] = useState('');
  const [createFileLoading, setCreateFileLoading] = useState(false);
  const [showRenameFileModal, setShowRenameFileModal] = useState(false);
  const [renameFilePath, setRenameFilePath] = useState(null);
  const [renameFileName, setRenameFileName] = useState('');
  const [renameFileLoading, setRenameFileLoading] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [trashFiles, setTrashFiles] = useState([]);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [printError, setPrintError] = useState(null);
  const [minimapEnabled, setMinimapEnabled] = useState(() => {
    try {
      return localStorage.getItem(MINIMAP_STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [splitMode, setSplitMode] = useState(() => {
    try {
      const stored = localStorage.getItem(SPLIT_MODE_STORAGE_KEY);
      return stored === 'horizontal' ? 'horizontal' : 'vertical';
    } catch {
      return 'vertical';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingPaths, setMatchingPaths] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDebouncing, setSearchDebouncing] = useState(false);
  const [filesError, setFilesError] = useState(null);
  const searchTimeoutRef = useRef(null);

  const openTab = useCallback((path, preferRight = true) => {
    setOpenTabs((prev) => {
      const idx = prev.indexOf(path);
      if (idx >= 0) {
        // Fichier déjà ouvert : recliquer ferme l'onglet (géré par le clic)
        return prev;
      }
      if (prev.length >= 3) return prev; // Max 3 fichiers ouverts
      const next = [...prev, path];
      if (next.length === 1) {
        setLeftTabIndex(0);
        setRightTabIndex(0);
      } else if (preferRight) {
        setRightTabIndex(next.length - 1);
      } else {
        setLeftTabIndex(next.length - 1);
      }
      return next;
    });
  }, []);

  const closeTab = useCallback((index) => {
    setOpenTabs((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const dec = (i) => (i > index ? i - 1 : i);
      let newLeft = dec(leftTabIndex);
      let newRight = dec(rightTabIndex);
      if (leftTabIndex === index) newLeft = Math.min(newRight, next.length - 1);
      if (rightTabIndex === index) newRight = Math.min(newLeft, next.length - 1);
      newLeft = Math.max(0, Math.min(newLeft, next.length - 1));
      newRight = Math.max(0, Math.min(newRight, next.length - 1));
      if (next.length <= 1) newRight = newLeft;
      setLeftTabIndex(newLeft);
      setRightTabIndex(newRight);
      return next;
    });
  }, [leftTabIndex, rightTabIndex]);

  const collapseToSingleTab = useCallback(() => {
    setOpenTabs((prev) => {
      if (prev.length <= 1) return prev;
      const idx = Math.min(rightTabIndex, prev.length - 1);
      const path = prev[idx];
      setLeftTabIndex(0);
      setRightTabIndex(0);
      return [path];
    });
  }, [rightTabIndex]);

  const toggleMinimap = () => {
    setMinimapEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MINIMAP_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const setSplitModeVertical = () => {
    setSplitMode('vertical');
    try {
      localStorage.setItem(SPLIT_MODE_STORAGE_KEY, 'vertical');
    } catch {}
  };

  const setSplitModeHorizontal = () => {
    setSplitMode('horizontal');
    try {
      localStorage.setItem(SPLIT_MODE_STORAGE_KEY, 'horizontal');
    } catch {}
  };

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
      .catch((e) => setFilesError(e.message));
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
      setOpenTabs((prev) => {
        const next = prev.filter((p) => p !== filePath);
        setLeftTabIndex(0);
        setRightTabIndex(Math.max(0, Math.min(1, next.length - 1)));
        return next;
      });
      setUploadError(null);
      fetchFiles();
      fetchTrash();
    } catch (err) {
      setUploadError(err.message || 'Erreur réseau.');
    }
  };

  const handlePrint = async (path) => {
    if (!path) return;
    setPrintError(null);
    setPdfLoading(true);
    const pdfUrl = `${API}/export-pdf?path=${encodeURIComponent(path)}`;
    try {
      const res = await fetch(pdfUrl);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setPrintError(err.message || 'Erreur lors de la génération du PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPdf = async (path) => {
    if (!path) return;
    setPrintError(null);
    setPdfLoading(true);
    const pdfUrl = `${API}/export-pdf?path=${encodeURIComponent(path)}`;
    try {
      const res = await fetch(pdfUrl);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const file = files.find((f) => f.path === path);
      const filename = (file?.name || path).replace(/\.(md|txt)$/i, '') + '.pdf';
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setPrintError(err.message || 'Erreur lors de la génération du PDF');
    } finally {
      setPdfLoading(false);
    }
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
      openTab(data.path);
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

  const handleCreateFileOpen = () => {
    setCreateFileName('');
    setShowCreateFileModal(true);
  };

  const handleRenameClick = (filePath, fileName, e) => {
    e.preventDefault();
    e.stopPropagation();
    const ext = fileName.match(/\.(md|txt)$/i)?.[0] || '';
    const base = fileName.slice(0, -ext.length);
    setRenameFilePath(filePath);
    setRenameFileName(base.replace(/_/g, ' '));
    setShowRenameFileModal(true);
  };

  const handleRenameFileSubmit = async () => {
    const name = renameFileName.trim();
    if (!name || !renameFilePath) return;
    setUploadError(null);
    setRenameFileLoading(true);
    try {
      const r = await fetch(`${API}/files/${encodeURIComponent(renameFilePath)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: name }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setUploadError(data.error || `Erreur ${r.status}`);
        return;
      }
      setShowRenameFileModal(false);
      setRenameFilePath(null);
      setRenameFileName('');
      setOpenTabs((prev) => prev.map((p) => (p === renameFilePath ? data.path : p)));
      fetchFiles();
    } catch (err) {
      setUploadError(err.message || 'Erreur réseau.');
    } finally {
      setRenameFileLoading(false);
    }
  };

  const handleCreateFileSubmit = async () => {
    const name = createFileName.trim();
    if (!name) return;
    setUploadError(null);
    setCreateFileLoading(true);
    try {
      const r = await fetch(`${API}/files/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setUploadError(data.error || `Erreur ${r.status}`);
        return;
      }
      setShowCreateFileModal(false);
      setCreateFileName('');
      fetchFiles();
      openTab(data.path);
    } catch (err) {
      setUploadError(err.message || 'Erreur réseau.');
    } finally {
      setCreateFileLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchTrash();
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setMatchingPaths([]);
      setSearchLoading(false);
      setSearchDebouncing(false);
      return;
    }
    setSearchDebouncing(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchDebouncing(false);
      setSearchLoading(true);
      fetch(`${API}/search?q=${encodeURIComponent(q)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((paths) => {
          setMatchingPaths(paths);
          setSearchLoading(false);
        })
        .catch(() => {
          setMatchingPaths([]);
          setSearchLoading(false);
        });
    }, 2000);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

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

  const displayFiles = searchQuery.trim()
    ? files.filter((f) => matchingPaths.includes(f.path))
    : files;

  const formatSize = (bytes) => {
    if (bytes == null || bytes === undefined) return '—';
    const n = Number(bytes);
    if (Number.isNaN(n) || n < 0) return '—';
    if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} Mo`;
    if (n >= 1024) return `${(n / 1024).toFixed(2)} Ko`;
    return `${n} octet${n !== 1 ? 's' : ''}`;
  };

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
        className={`sidebar ${isDragging ? 'sidebar--drag-over' : ''} ${sidebarHidden ? 'sidebar--hidden' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="sidebar-search">
          <div className="search-input-wrap">
            <input
              type="search"
              className="sidebar-search-input"
              placeholder="Rechercher dans les documents…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Rechercher dans les documents"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                title="Effacer la recherche"
                aria-label="Effacer la recherche"
              >
                ×
              </button>
            )}
          </div>
        </div>
        <a
          href="#"
          className={`sidebar-nav-link ${openTabs.length === 0 ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setOpenTabs([]);
            setLeftTabIndex(0);
            setRightTabIndex(0);
          }}
        >
          Vue d'ensemble
        </a>
        <div className="sidebar-header">
          <h2>Fichiers</h2>
          <div className="sidebar-header-actions">
            <button type="button" className="btn-refresh btn-refresh--icon" onClick={handleCreateFileOpen} title="Nouveau fichier" aria-label="Nouveau fichier">
              <PlusIcon className="btn-refresh-icon" />
            </button>
            <button type="button" className="btn-refresh btn-refresh--icon" onClick={refreshAll} title="Actualiser la liste">
              <ArrowPathIcon className="btn-refresh-icon" />
            </button>
            <button type="button" className="btn-refresh btn-refresh--icon" onClick={() => setSidebarHidden(true)} title="Masquer la barre latérale" aria-label="Masquer la barre latérale">
              <ChevronLeftIcon className="btn-refresh-icon" />
            </button>
          </div>
        </div>
        {(uploadError || filesError) && (
          <div className="sidebar-upload-error">{uploadError || filesError}</div>
        )}
        {uploading && (
          <div className="sidebar-uploading">Copie en cours…</div>
        )}
        <ul className="file-list sidebar-file-list">
          {files.length === 0 && !filesError && !uploading && (
            <li className="file-list-empty">
              Aucun fichier. Glissez-déposez des fichiers .txt ou .md ici.
            </li>
          )}
          {files.length > 0 && searchQuery.trim() && (searchLoading || searchDebouncing) && (
            <li className="file-list-empty">Recherche en cours…</li>
          )}
          {files.length > 0 && searchQuery.trim() && !searchLoading && !searchDebouncing && displayFiles.length === 0 && (
            <li className="file-list-empty">
              Aucun document ne contient « {searchQuery.trim()} ».
            </li>
          )}
          {(!searchQuery.trim() || (!searchLoading && !searchDebouncing)) && displayFiles.map((f) => {
            const tabIndex = openTabs.indexOf(f.path);
            const isOpen = tabIndex >= 0;
            return (
              <li key={f.path} className="file-list-item">
                <a
                  href="#"
                  className={isOpen ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isOpen) {
                      closeTab(tabIndex);
                    } else if (openTabs.length < 3) {
                      openTab(f.path, !e.ctrlKey && !e.metaKey);
                    }
                  }}
                  title={isOpen
                    ? "Cliquer pour fermer l'onglet"
                    : openTabs.length >= 3
                      ? "3 fichiers ouverts · Fermez-en un pour en ouvrir un autre"
                      : "Cliquer pour ouvrir · Ctrl+clic pour ouvrir côte à côte"}
                >
                  {f.name}
                </a>
                {isOpen && (
                  <button
                    type="button"
                    className="file-list-action file-list-close-tab"
                    title="Fermer l'onglet"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      closeTab(tabIndex);
                    }}
                    aria-label={`Fermer ${f.name}`}
                  >
                    <XMarkIcon className="file-list-action-icon" />
                  </button>
                )}
                <button
                  type="button"
                  className="file-list-action file-list-rename"
                  title="Renommer ce fichier"
                  onClick={(e) => handleRenameClick(f.path, f.name, e)}
                  aria-label={`Renommer ${f.name}`}
                >
                  <PencilIcon className="file-list-action-icon" />
                </button>
                <button
                  type="button"
                  className="file-list-action file-list-delete"
                  title="Supprimer ce fichier"
                  onClick={(e) => handleDeleteClick(f.path, e)}
                  aria-label={`Supprimer ${f.name}`}
                >
                  ×
                </button>
              </li>
            );
          })}
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
      {sidebarHidden && (
        <button
          type="button"
          className="sidebar-toggle-floating"
          onClick={() => setSidebarHidden(false)}
          title="Afficher la barre latérale"
          aria-label="Afficher la barre latérale"
        >
          <Bars3Icon className="sidebar-toggle-floating-icon" />
        </button>
      )}
      <div className={`viewer-wrap ${sidebarHidden ? 'viewer-wrap--sidebar-hidden' : ''}`}>
        <div className={`viewer-content ${openTabs.length >= 2 ? `viewer-content--split viewer-content--split-${splitMode}${openTabs.length === 3 ? ' viewer-content--split-3' : ''}` : ''}`}>
          {openTabs.length === 0 && (
            <div className="viewer-container">
              <div className="viewer">
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
              </div>
            </div>
          )}
          {openTabs.length === 1 && (
            <DocumentPane
              path={openTabs[0]}
              files={files}
              minimapEnabled={minimapEnabled}
              onPrint={handlePrint}
              onDownloadPdf={handleDownloadPdf}
              pdfLoading={pdfLoading}
              printError={printError}
              onClose={() => closeTab(0)}
            />
          )}
          {openTabs.length >= 2 && (
            <>
              <div className="document-pane-wrapper">
                <DocumentPane
                  path={openTabs[0]}
                  files={files}
                  minimapEnabled={minimapEnabled}
                  onPrint={handlePrint}
                  onDownloadPdf={handleDownloadPdf}
                  pdfLoading={pdfLoading}
                  printError={printError}
                  onClose={() => closeTab(0)}
                />
              </div>
              <div className="document-pane-wrapper">
                <DocumentPane
                  path={openTabs[1]}
                  files={files}
                  minimapEnabled={minimapEnabled}
                  onPrint={handlePrint}
                  onDownloadPdf={handleDownloadPdf}
                  pdfLoading={pdfLoading}
                  printError={printError}
                  onClose={() => closeTab(1)}
                />
              </div>
              {openTabs.length >= 3 && (
                <div className="document-pane-wrapper">
                  <DocumentPane
                    path={openTabs[2]}
                    files={files}
                    minimapEnabled={minimapEnabled}
                    onPrint={handlePrint}
                    onDownloadPdf={handleDownloadPdf}
                    pdfLoading={pdfLoading}
                    printError={printError}
                    onClose={() => closeTab(2)}
                  />
                </div>
              )}
            </>
          )}
        </div>
        {openTabs.length >= 2 && (() => {
          const panes = openTabs.slice(0, 3).map((path) => files.find((f) => f.path === path));
          return (
            <footer className={`split-footer split-footer--${splitMode}`} role="contentinfo">
              {panes.map((file, i) => (
                <div key={openTabs[i]} className="split-footer-pane">
                  <span className="split-footer-meta">
                    Taille {formatSize(file?.size)}
                    {' · '}
                    Créé le {formatDate(file?.createdAt)}
                    {' · '}
                    Modifié le {formatDate(file?.modifiedAt)}
                  </span>
                </div>
              ))}
            </footer>
          );
        })()}
        <footer className="status-bar">
          {openTabs.length >= 2 && (
            <div className="status-bar-split-group">
              <button
                type="button"
                className="status-bar-btn status-bar-btn-icon"
                onClick={collapseToSingleTab}
                title="Garder uniquement le panneau droit (un seul document)"
                aria-label="Réduire à un seul panneau"
              >
                <ArrowsPointingInIcon className="status-bar-icon" />
              </button>
              <button
                type="button"
                className={`status-bar-btn status-bar-btn-icon ${splitMode === 'vertical' ? 'active' : ''}`}
                onClick={setSplitModeVertical}
                title="Scinder verticalement (côte à côte)"
                aria-label="Scinder verticalement"
              >
                <SplitVerticalIcon className="status-bar-icon" />
              </button>
              <button
                type="button"
                className={`status-bar-btn status-bar-btn-icon ${splitMode === 'horizontal' ? 'active' : ''}`}
                onClick={setSplitModeHorizontal}
                title="Scinder horizontalement (empilé)"
                aria-label="Scinder horizontalement"
              >
                <SplitHorizontalIcon className="status-bar-icon" />
              </button>
            </div>
          )}
          <button
            type="button"
            className={`status-bar-btn ${minimapEnabled ? 'active' : ''}`}
            onClick={toggleMinimap}
            title={minimapEnabled ? 'Masquer la minimap' : 'Afficher la minimap'}
          >
            Minimap
          </button>
        </footer>
      </div>
      <RenameFileModal
        open={showRenameFileModal}
        value={renameFileName}
        onChange={setRenameFileName}
        onConfirm={handleRenameFileSubmit}
        onCancel={() => {
          setShowRenameFileModal(false);
          setRenameFilePath(null);
          setRenameFileName('');
        }}
        renaming={renameFileLoading}
      />
      <CreateFileModal
        open={showCreateFileModal}
        value={createFileName}
        onChange={setCreateFileName}
        onConfirm={handleCreateFileSubmit}
        onCancel={() => setShowCreateFileModal(false)}
        creating={createFileLoading}
      />
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
