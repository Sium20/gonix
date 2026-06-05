"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropzone({
  name,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  value,
  onChange,
  className,
  required,
  label,
  hint,
}: {
  name: string;
  accept?: string;
  maxSizeMB?: number;
  value: File | null;
  onChange: (f: File | null) => void;
  className?: string;
  required?: boolean;
  label?: string;
  hint?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Only JPG, PNG, or WebP allowed");
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large (max ${maxSizeMB} MB)`);
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      onChange(file);
    },
    [maxSizeMB, onChange, previewUrl]
  );

  const clear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <p className="text-xs font-medium text-fg-muted uppercase tracking-wide">{label}</p> : null}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        onClick={() => !value && inputRef.current?.click()}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out",
          "flex flex-col items-center justify-center text-center",
          value ? "p-3 border-solid border-accent/40 bg-accent/5 cursor-default" : "p-8 cursor-pointer hover:border-fg/30",
          dragOver ? "border-accent bg-accent/5" : "border-line",
          error && "border-danger/40"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          required={required}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {value && previewUrl ? (
          <div className="flex items-center gap-4 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-20 w-28 object-cover rounded-md border border-line" />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium truncate">{value.name}</p>
              <p className="text-xs text-fg-muted">{(value.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              className="h-8 w-8 rounded-md hover:bg-fg/10 flex items-center justify-center text-fg-muted hover:text-fg"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="h-12 w-12 rounded-full bg-fg/5 flex items-center justify-center mb-3">
              <Upload className="h-5 w-5 text-fg-muted" />
            </div>
            <p className="text-sm font-medium">
              Drop your file here or <span className="text-accent">browse</span>
            </p>
            <p className="text-xs text-fg-muted mt-1">JPG, PNG, WebP — up to {maxSizeMB} MB</p>
            {hint ? <p className="text-xs text-fg-dim mt-2">{hint}</p> : null}
          </>
        )}
      </div>

      {error ? (
        <p className="text-xs text-danger flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      ) : null}
    </div>
  );
}
