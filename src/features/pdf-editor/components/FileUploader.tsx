/**
 * Componente FileUploader
 * Responsabilidad: Permitir drag & drop y selección de archivos
 * Reutilizable para PDF y imágenes
 */

"use client";

import { useCallback, useState } from "react";
import { Upload, File, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface FileUploaderProps {
  accept: string;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  label: string;
  description?: string;
  maxSizeMB?: number;
  className?: string;
}

export function FileUploader({
  accept,
  onFileSelect,
  disabled = false,
  label,
  description,
  maxSizeMB = 10,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida el tamaño del archivo
   */
  const validateFile = useCallback(
    (file: File): boolean => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`El archivo debe ser menor a ${maxSizeMB}MB`);
        return false;
      }
      setError(null);
      return true;
    },
    [maxSizeMB],
  );

  /**
   * Maneja la selección de archivo
   */
  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect],
  );

  /**
   * Input file change handler
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input para permitir seleccionar el mismo archivo
      e.target.value = "";
    },
    [handleFile],
  );

  /**
   * Drag and drop handlers
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile],
  );

  return (
    <div className={cn("w-full", className)}>
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative flex flex-col items-center justify-center",
          "w-full rounded-lg border-2 border-dashed",
          "px-4 py-8 md:px-6 md:py-12",
          "transition-all duration-200",
          "cursor-pointer touch-manipulation",
          isDragging && "border-primary bg-primary/5 scale-[1.02]",
          !isDragging &&
            "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 active:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
        />

        {/* Icon */}
        <div
          className={cn(
            "mb-3 md:mb-4 rounded-full p-3 md:p-4",
            "bg-muted transition-colors duration-200",
            "group-hover:bg-primary/10",
          )}
        >
          {isDragging ? (
            <File className="size-8 md:size-10 text-primary" />
          ) : (
            <Upload className="size-8 md:size-10 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </div>

        {/* Text */}
        <div className="text-center space-y-1 md:space-y-2">
          <p className="text-sm md:text-base font-medium text-foreground">
            {isDragging ? "Suelta el archivo aquí" : label}
          </p>
          {description && (
            <p className="text-xs md:text-sm text-muted-foreground">
              {description}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Máximo {maxSizeMB}MB</p>
        </div>
      </label>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
