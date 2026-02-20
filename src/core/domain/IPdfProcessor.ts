/**
 * Interfaz del procesador de PDF
 * Contrato que deben cumplir todas las implementaciones (local o cloud)
 * Inversión de Dependencias: la lógica de negocio depende de esta abstracción
 */

import type {
  PdfDocument,
  SignaturePlacement,
  SignatureImage,
  ProcessedPdfResult,
} from "./types";

export interface IPdfProcessor {
  /**
   * Valida que un archivo sea un PDF válido
   */
  validatePdf(file: File): Promise<boolean>;

  /**
   * Obtiene el número de páginas del PDF
   */
  getPageCount(file: File): Promise<number>;

  /**
   * Procesa el PDF insertando las firmas en las posiciones especificadas
   * @param document - Documento PDF a procesar
   * @param signatures - Array de imágenes de firma
   * @param placements - Array de posiciones donde colocar las firmas
   * @returns PDF procesado como Blob
   */
  processPdf(
    document: PdfDocument,
    signatures: SignatureImage[],
    placements: SignaturePlacement[],
  ): Promise<ProcessedPdfResult>;

  /**
   * Libera recursos del procesador
   */
  dispose(): void;
}
