/**
 * Hook Principal del Editor de PDF
 * Gestiona todo el estado y lógica del editor
 * Principio de Responsabilidad Única: Coordina el flujo del editor
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  PdfDocument,
  SignatureImage,
  SignaturePlacement,
  EditorStatus,
  ProcessedPdfResult,
} from "@/core/domain/types";
import type { IPdfProcessor } from "@/core/domain/IPdfProcessor";
import { createLocalPdfProcessor } from "../services/LocalPdfProcessor";

interface UsePdfEditorReturn {
  // Estado
  status: EditorStatus;
  error: string | null;
  pdfDocument: PdfDocument | null;
  signatures: SignatureImage[];
  placements: SignaturePlacement[];
  currentPage: number;

  // Acciones de documento
  uploadPdf: (file: File) => Promise<void>;
  clearPdf: () => void;

  // Acciones de firma
  addSignature: (file: File) => Promise<void>;
  removeSignature: (id: string) => void;

  // Acciones de placement
  addPlacement: (signatureId: string, pageNumber: number) => void;
  updatePlacement: (
    placementId: string,
    updates: Partial<SignaturePlacement>,
  ) => void;
  removePlacement: (placementId: string) => void;

  // Navegación
  goToPage: (pageNumber: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Procesamiento
  processPdf: () => Promise<ProcessedPdfResult>;

  // Utilidades
  canProcess: boolean;
  hasUnsavedChanges: boolean;
}

export function usePdfEditor(): UsePdfEditorReturn {
  // Estado del editor
  const [status, setStatus] = useState<EditorStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PdfDocument | null>(null);
  const [signatures, setSignatures] = useState<SignatureImage[]>([]);
  const [placements, setPlacements] = useState<SignaturePlacement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Referencia al procesador (Strategy Pattern)
  const processorRef = useRef<IPdfProcessor>(createLocalPdfProcessor());

  /**
   * Carga un PDF en el editor
   */
  const uploadPdf = useCallback(async (file: File) => {
    try {
      setStatus("pdf-loading");
      setError(null);

      // Validar el PDF
      const isValid = await processorRef.current.validatePdf(file);
      if (!isValid) {
        throw new Error("El archivo no es un PDF válido");
      }

      // Obtener número de páginas
      const pageCount = await processorRef.current.getPageCount(file);

      // Crear documento
      const document: PdfDocument = {
        id: uuidv4(),
        file,
        name: file.name,
        pageCount,
        uploadedAt: new Date(),
      };

      setPdfDocument(document);
      setCurrentPage(1);
      setPlacements([]); // Limpiar placements anteriores
      setStatus("ready");
      setHasUnsavedChanges(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cargar el PDF";
      setError(message);
      setStatus("error");
      console.error("Upload PDF error:", err);
    }
  }, []);

  /**
   * Limpia el PDF del editor
   */
  const clearPdf = useCallback(() => {
    setPdfDocument(null);
    setPlacements([]);
    setCurrentPage(1);
    setError(null);
    setStatus("idle");
    setHasUnsavedChanges(false);
  }, []);

  /**
   * Agrega una imagen de firma
   */
  const addSignature = useCallback(
    async (file: File) => {
      try {
        setStatus("signature-loading");
        setError(null);

        // Validar tipo de archivo
        if (!file.type.startsWith("image/")) {
          throw new Error("El archivo debe ser una imagen (PNG, JPG)");
        }

        // Crear data URL para preview
        const dataUrl = await fileToDataUrl(file);

        const signature: SignatureImage = {
          id: uuidv4(),
          file,
          dataUrl,
          name: file.name,
          uploadedAt: new Date(),
        };

        setSignatures((prev) => [...prev, signature]);
        setStatus(pdfDocument ? "ready" : "idle");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al cargar la firma";
        setError(message);
        setStatus("error");
        console.error("Add signature error:", err);
      }
    },
    [pdfDocument],
  );

  /**
   * Elimina una firma y sus placements asociados
   */
  const removeSignature = useCallback((id: string) => {
    setSignatures((prev) => prev.filter((sig) => sig.id !== id));
    setPlacements((prev) => prev.filter((p) => p.signatureId !== id));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Agrega un placement de firma en la página actual
   */
  const addPlacement = useCallback(
    (signatureId: string, pageNumber: number) => {
      const placement: SignaturePlacement = {
        id: uuidv4(),
        signatureId,
        pageNumber,
        coordinates: {
          x: 0.1, // 10% desde la izquierda
          y: 0.1, // 10% desde arriba
          width: 0.2, // 20% del ancho
          height: 0.1, // 10% del alto
          rotation: 0,
        },
      };

      setPlacements((prev) => [...prev, placement]);
      setHasUnsavedChanges(true);
    },
    [],
  );

  /**
   * Actualiza un placement existente
   */
  const updatePlacement = useCallback(
    (placementId: string, updates: Partial<SignaturePlacement>) => {
      setPlacements((prev) =>
        prev.map((p) => (p.id === placementId ? { ...p, ...updates } : p)),
      );
      setHasUnsavedChanges(true);
    },
    [],
  );

  /**
   * Elimina un placement
   */
  const removePlacement = useCallback((placementId: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== placementId));
    setHasUnsavedChanges(true);
  }, []);

  /**
   * Navega a una página específica
   */
  const goToPage = useCallback(
    (pageNumber: number) => {
      if (!pdfDocument) return;

      const validPage = Math.max(
        1,
        Math.min(pageNumber, pdfDocument.pageCount),
      );
      setCurrentPage(validPage);
    },
    [pdfDocument],
  );

  /**
   * Página siguiente
   */
  const nextPage = useCallback(() => {
    if (!pdfDocument || currentPage >= pdfDocument.pageCount) return;
    setCurrentPage((prev) => prev + 1);
  }, [pdfDocument, currentPage]);

  /**
   * Página anterior
   */
  const prevPage = useCallback(() => {
    if (currentPage <= 1) return;
    setCurrentPage((prev) => prev - 1);
  }, [currentPage]);

  /**
   * Procesa el PDF con las firmas
   */
  const processPdf = useCallback(async (): Promise<ProcessedPdfResult> => {
    if (!pdfDocument) {
      throw new Error("No hay documento PDF cargado");
    }

    if (placements.length === 0) {
      throw new Error("Debe colocar al menos una firma");
    }

    try {
      setStatus("processing");
      setError(null);

      const result = await processorRef.current.processPdf(
        pdfDocument,
        signatures,
        placements,
      );

      setStatus("ready");
      setHasUnsavedChanges(false);

      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al procesar el PDF";
      setError(message);
      setStatus("error");
      throw err;
    }
  }, [pdfDocument, signatures, placements]);

  // Validaciones
  const canProcess =
    status === "ready" &&
    pdfDocument !== null &&
    signatures.length > 0 &&
    placements.length > 0;

  return {
    // Estado
    status,
    error,
    pdfDocument,
    signatures,
    placements,
    currentPage,

    // Acciones
    uploadPdf,
    clearPdf,
    addSignature,
    removeSignature,
    addPlacement,
    updatePlacement,
    removePlacement,
    goToPage,
    nextPage,
    prevPage,
    processPdf,

    // Utilidades
    canProcess,
    hasUnsavedChanges,
  };
}

/**
 * Convierte un File a Data URL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
