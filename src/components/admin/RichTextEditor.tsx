"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  RemoveFormatting,
  Undo,
  Redo,
  Code,
  Eye,
  Check,
  X,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  helperText?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Escribe el contenido aquí...",
  minHeight = "160px",
  label,
  helperText,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const savedSelectionRef = useRef<Range | null>(null);

  // Active toolbar formats state
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
    orderedList: false,
    h2: false,
    h3: false,
  });

  // Sync external value with editor content
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
    setRawHtml(value || "");
  }, [value]);

  // Check if content is effectively empty (e.g. <br>, <p><br></p>, whitespace)
  const isContentEmpty = (html: string) => {
    if (!html) return true;
    if (/<(img|hr|iframe|svg|table)[^>]*>/i.test(html)) return false;
    const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    return text.length === 0;
  };

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const finalHtml = isContentEmpty(currentHtml) ? "" : currentHtml;
    setRawHtml(finalHtml);
    onChange(finalHtml);
    updateActiveFormats();
  }, [onChange]);

  // Query formatting state to toggle button active visual styles
  const updateActiveFormats = () => {
    if (typeof document === "undefined" || !editorRef.current) return;
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const node = selection.anchorNode;
      const parentElement = node?.nodeType === 3 ? node.parentElement : (node as HTMLElement);

      const isH2 = Boolean(parentElement?.closest("h2"));
      const isH3 = Boolean(parentElement?.closest("h3"));

      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
        orderedList: document.queryCommandState("insertOrderedList"),
        h2: isH2,
        h3: isH3,
      });
    } catch {
      // Ignore queryCommand errors if outside document
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    emitChange();
  };

  const handleHeading = (tag: "h2" | "h3" | "p") => {
    if (isHtmlMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    // Toggle back to paragraph if already in that heading
    if ((tag === "h2" && activeFormats.h2) || (tag === "h3" && activeFormats.h3)) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    emitChange();
  };

  // Link handling
  const handleOpenLinkModal = () => {
    if (isHtmlMode) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
    setLinkUrl("https://");
    setShowLinkInput(true);
  };

  const handleApplyLink = () => {
    if (!linkUrl || linkUrl.trim() === "https://" || linkUrl.trim() === "") {
      setShowLinkInput(false);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Restore saved selection
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }

    const sel = window.getSelection();
    const hasSelection = sel && !sel.isCollapsed;

    if (hasSelection) {
      document.execCommand("createLink", false, linkUrl.trim());
    } else {
      const linkHtml = `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer">${linkUrl.trim()}</a>`;
      document.execCommand("insertHTML", false, linkHtml);
    }

    // Ensure link has target and rel
    if (editorRef.current) {
      const links = editorRef.current.querySelectorAll("a");
      links.forEach((a) => {
        if (!a.getAttribute("target")) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        }
      });
    }

    setShowLinkInput(false);
    setLinkUrl("");
    savedSelectionRef.current = null;
    emitChange();
  };

  const handleRemoveLink = () => {
    executeCommand("unlink");
  };

  const handleToggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to visual
      const cleanContent = isContentEmpty(rawHtml) ? "" : rawHtml;
      if (editorRef.current) {
        editorRef.current.innerHTML = cleanContent;
      }
      onChange(cleanContent);
      setIsHtmlMode(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          updateActiveFormats();
        }
      }, 0);
    } else {
      // Switching from visual to HTML
      const currentHtml = editorRef.current ? editorRef.current.innerHTML : (value || "");
      const cleanContent = isContentEmpty(currentHtml) ? "" : currentHtml;
      setRawHtml(cleanContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = cleanContent;
      }
      setIsHtmlMode(true);
    }
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setRawHtml(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
    const cleanContent = isContentEmpty(newHtml) ? "" : newHtml;
    onChange(cleanContent);
  };

  const wordCount = (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">{label}</label>
          <button
            type="button"
            onClick={handleToggleHtmlMode}
            className="text-[11px] font-medium text-slate-500 hover:text-[var(--blue-karmax)] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100"
          >
            {isHtmlMode ? (
              <>
                <Eye className="w-3 h-3 text-[var(--green-karmax)]" />
                <span>Vista Visual</span>
              </>
            ) : (
              <>
                <Code className="w-3 h-3 text-slate-400" />
                <span>Editar HTML</span>
              </>
            )}
          </button>
        </div>
      )}

      <div
        className={`rounded-xl border transition-all duration-200 overflow-hidden bg-white ${
          isFocused
            ? "border-[var(--green-karmax)] ring-2 ring-[var(--green-karmax)]/15 shadow-xs"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        {/* Toolbar */}
        <div className="bg-slate-50/90 border-b border-slate-200/90 px-2 py-1.5 flex flex-wrap items-center gap-0.5 select-none">
          {/* Headings */}
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleHeading("h2");
              }}
              title="Encabezado 2"
              disabled={isHtmlMode}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-0.5 ${
                activeFormats.h2
                  ? "bg-slate-200 text-[var(--blue-karmax)]"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40"
              }`}
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleHeading("h3");
              }}
              title="Encabezado 3"
              disabled={isHtmlMode}
              className={`p-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-0.5 ${
                activeFormats.h3
                  ? "bg-slate-200 text-[var(--blue-karmax)]"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40"
              }`}
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text Style: Bold, Italic, Underline, Strikethrough */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("bold");
              }}
              title="Negrita (Ctrl+B)"
              disabled={isHtmlMode}
              className={`p-1.5 rounded-lg transition-colors ${
                activeFormats.bold
                  ? "bg-slate-200 text-[var(--blue-karmax)]"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40"
              }`}
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("italic");
              }}
              title="Cursiva (Ctrl+I)"
              disabled={isHtmlMode}
              className={`p-1.5 rounded-lg transition-colors ${
                activeFormats.italic
                  ? "bg-slate-200 text-[var(--blue-karmax)]"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40"
              }`}
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("underline");
              }}
              title="Subrayado (Ctrl+U)"
              disabled={isHtmlMode}
              className={`p-1.5 rounded-lg transition-colors ${
                activeFormats.underline
                  ? "bg-slate-200 text-[var(--blue-karmax)]"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40"
              }`}
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("strikeThrough");
              }}
              title="Tachado"
              disabled={isHtmlMode}
              className={`p-1.5 rounded-lg transition-colors ${
                activeFormats.strikeThrough
                  ? "bg-slate-200 text-[var(--blue-karmax)]"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40"
              }`}
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lists: Bullets & Numbers */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("insertUnorderedList");
              }}
              title="Lista de viñetas"
              disabled={isHtmlMode}
              className={`p-1.5 rounded-lg transition-colors ${
                activeFormats.unorderedList
                  ? "bg-slate-200 text-[var(--blue-karmax)]"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40"
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("insertOrderedList");
              }}
              title="Lista numerada"
              disabled={isHtmlMode}
              className={`p-1.5 rounded-lg transition-colors ${
                activeFormats.orderedList
                  ? "bg-slate-200 text-[var(--blue-karmax)]"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 disabled:opacity-40"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleOpenLinkModal();
              }}
              title="Insertar enlace"
              disabled={isHtmlMode}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors disabled:opacity-40"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleRemoveLink();
              }}
              title="Quitar enlace"
              disabled={isHtmlMode}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors disabled:opacity-40"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean Format, Undo & Redo */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("removeFormat");
              }}
              title="Limpiar formato"
              disabled={isHtmlMode}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors disabled:opacity-40"
            >
              <RemoveFormatting className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("undo");
              }}
              title="Deshacer (Ctrl+Z)"
              disabled={isHtmlMode}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors disabled:opacity-40"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                executeCommand("redo");
              }}
              title="Rehacer (Ctrl+Y)"
              disabled={isHtmlMode}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors disabled:opacity-40"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick HTML Toggle (in case label is hidden or for convenience) */}
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleHtmlMode}
              title={isHtmlMode ? "Cambiar a editor visual" : "Editar código HTML"}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                isHtmlMode
                  ? "bg-[var(--blue-karmax)] text-white shadow-2xs"
                  : "bg-slate-200/80 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {isHtmlMode ? <Eye className="w-3 h-3" /> : <Code className="w-3 h-3" />}
              <span>{isHtmlMode ? "Visual" : "HTML"}</span>
            </button>
          </div>
        </div>

        {/* Link Input Bar */}
        {showLinkInput && !isHtmlMode && (
          <div className="bg-blue-50/70 border-b border-blue-100 p-2 flex items-center gap-2 text-xs">
            <span className="font-semibold text-[var(--blue-karmax)] whitespace-nowrap">
              Enlace URL:
            </span>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyLink();
                } else if (e.key === "Escape") {
                  setShowLinkInput(false);
                }
              }}
              placeholder="https://ejemplo.com"
              autoFocus
              className="flex-1 bg-white border border-blue-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs focus:outline-none focus:border-[var(--green-karmax)]"
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="bg-[var(--blue-karmax)] text-white hover:bg-[var(--light-blue-karmax)] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" />
              <span>Insertar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(false);
                savedSelectionRef.current = null;
              }}
              className="bg-slate-200 text-slate-600 hover:bg-slate-300 px-2 py-1 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Editor Body */}
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="<p>Escribe tu código HTML aquí...</p>"
          style={{ minHeight, display: isHtmlMode ? "block" : "none" }}
          className="w-full p-3 font-mono text-xs text-slate-800 bg-slate-900/5 focus:outline-none resize-y leading-relaxed border-0"
        />

        <div className={`relative ${isHtmlMode ? "hidden" : "block"}`}>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emitChange}
            onFocus={() => {
              setIsFocused(true);
              updateActiveFormats();
            }}
            onBlur={() => {
              setIsFocused(false);
              emitChange();
            }}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            style={{ minHeight }}
            className="rich-text-editor-content w-full p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-none leading-relaxed overflow-y-auto"
          />
          {/* Placeholder */}
          {isContentEmpty(value || "") && !isFocused && (
            <div
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.focus();
                }
              }}
              className="absolute top-3.5 left-3.5 text-slate-400 text-xs sm:text-sm pointer-events-none select-none"
            >
              {placeholder}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50/70 border-t border-slate-100 px-3 py-1 flex items-center justify-between text-[11px] text-slate-400">
          <div>{helperText || "Soporta texto enriquecido, viñetas, títulos y enlaces."}</div>
          <div className="font-mono text-[10px]">
            {wordCount} palabras • {isHtmlMode ? "Código HTML" : "Modo Visual"}
          </div>
        </div>
      </div>
    </div>
  );
};
