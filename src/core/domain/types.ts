/**
 * Core Domain Types
 * Representan las entidades de negocio del sistema
 * Sin dependencias de frameworks externos
 */

/**
 * Coordenadas absolutas en píxeles del canvas
 */
export interface AbsoluteCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

/**
 * Coordenadas relativas (0-1) respecto al tamaño del PDF
 * Permite escalado independiente del dispositivo
 */
export interface RelativeCoordinates {
  x: number; // 0-1 (porcentaje del ancho)
  y: number; // 0-1 (porcentaje del alto)
  width: number; // 0-1 (porcentaje del ancho)
  height: number; // 0-1 (porcentaje del alto)
  rotation?: number; // grados
}

/**
 * Representa un documento PDF en el sistema
 */
export interface PdfDocument {
  id: string;
  file: File;
  name: string;
  pageCount: number;
  uploadedAt: Date;
}

/**
 * Representa una imagen de firma
 */
export interface SignatureImage {
  id: string;
  file: File;
  dataUrl: string;
  name: string;
  uploadedAt: Date;
}

/**
 * Posición de una firma en una página específica
 */
export interface SignaturePlacement {
  id: string;
  signatureId: string;
  pageNumber: number;
  coordinates: RelativeCoordinates;
}

/**
 * Resultado del procesamiento de un PDF
 */
export interface ProcessedPdfResult {
  blob: Blob;
  fileName: string;
  processedAt: Date;
}

/**
 * Estado del editor de PDF
 */
export type EditorStatus =
  | "idle"
  | "pdf-loading"
  | "signature-loading"
  | "processing"
  | "ready"
  | "error";

/**
 * Error del dominio
 */
export interface DomainError {
  code: string;
  message: string;
  details?: unknown;
}
