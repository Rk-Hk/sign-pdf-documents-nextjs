/**
 * Componente PdfViewer
 * Responsabilidad: Renderizar una página de PDF usando react-pdf
 * Debe ser cargado dinámicamente con ssr: false
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import type { PdfDocument } from "@/core/domain/types";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configurar worker de pdf.js
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  document: PdfDocument;
  pageNumber: number;
  onPageLoad?: (pageInfo: { width: number; height: number }) => void;
  className?: string;
  width?: number;
}

export function PdfViewer({
  document,
  pageNumber,
  onPageLoad,
  className,
  width = 800,
}: PdfViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfWidth, setPdfWidth] = useState<number>(width);

  /**
   * Actualizar el ancho del PDF cuando cambia el prop width
   * Restar padding del Card para que no se desborde
   */
  useEffect(() => {
    if (width > 0) {
      // Restar el padding del Card (p-2 md:p-4 = 8px o 16px por lado = 16px o 32px total)
      // Usar un valor conservador de 32px para evitar overflow
      const cardPadding = 32;
      const adjustedWidth = width > cardPadding ? width - cardPadding : width;
      setPdfWidth(Math.max(adjustedWidth, 280)); // Mínimo 280px
    } else {
      setPdfWidth(800); // Fallback
    }
  }, [width]);

  /**
   * Handler cuando el documento se carga
   */
  const handleDocumentLoadSuccess = useCallback(
    (data: { numPages: number }) => {
      setNumPages(data.numPages);
      setError(null);
    },
    [],
  );

  /**
   * Handler cuando hay error al cargar
   */
  const handleDocumentLoadError = useCallback((err: Error) => {
    console.error("PDF load error:", err);
    setError("Error al cargar el PDF. Intente nuevamente.");
    setIsLoading(false);
  }, []);

  /**
   * Handler cuando la página se renderiza
   */
  const handlePageLoadSuccess = useCallback(
    (page: { width: number; height: number }) => {
      setIsLoading(false);
      onPageLoad?.(page);
    },
    [onPageLoad],
  );

  /**
   * Crear URL del archivo PDF
   */
  const fileUrl = document.file;

  return (
    <div className={className}>
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 md:py-12">
          <Loader2 className="size-6 md:size-8 animate-spin text-primary" />
          <span className="ml-2 text-xs md:text-sm text-muted-foreground">
            Cargando documento...
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* PDF Document */}
      <Document
        file={fileUrl}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={handleDocumentLoadError}
        loading={null}
        error={null}
        className="flex justify-center"
      >
        <Page
          pageNumber={pageNumber}
          width={pdfWidth}
          onLoadSuccess={handlePageLoadSuccess}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          className="shadow-lg"
        />
      </Document>

      {/* Page info */}
      {numPages && !isLoading && (
        <div className="mt-3 md:mt-4 text-center text-xs md:text-sm text-muted-foreground">
          Página {pageNumber} de {numPages}
        </div>
      )}
    </div>
  );
}
