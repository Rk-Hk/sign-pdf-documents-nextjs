/**
 * Implementación Local del Procesador de PDF
 * Usa pdf-lib para procesar PDFs completamente en el navegador (RAM)
 * Privacy by Design: No se envían datos al servidor
 */

import { PDFDocument, degrees } from "pdf-lib";
import type { IPdfProcessor } from "@/core/domain/IPdfProcessor";
import type {
  PdfDocument,
  SignaturePlacement,
  SignatureImage,
  ProcessedPdfResult,
} from "@/core/domain/types";

export class LocalPdfProcessor implements IPdfProcessor {
  /**
   * Valida que un archivo sea un PDF válido
   */
  async validatePdf(file: File): Promise<boolean> {
    try {
      // Verificar extensión
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return false;
      }

      // Intentar cargar el PDF
      const arrayBuffer = await file.arrayBuffer();
      await PDFDocument.load(arrayBuffer);

      return true;
    } catch (error) {
      console.error("PDF validation error:", error);
      return false;
    }
  }

  /**
   * Obtiene el número de páginas del PDF
   */
  async getPageCount(file: File): Promise<number> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (error) {
      console.error("Error getting page count:", error);
      throw new Error("No se pudo leer el número de páginas del PDF");
    }
  }

  /**
   * Procesa el PDF insertando las firmas en las posiciones especificadas
   * Todo el procesamiento ocurre en memoria RAM del navegador
   */
  async processPdf(
    document: PdfDocument,
    signatures: SignatureImage[],
    placements: SignaturePlacement[],
  ): Promise<ProcessedPdfResult> {
    try {
      // 1. Cargar el PDF original
      const arrayBuffer = await document.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // 2. Crear un mapa de firmas por ID para acceso rápido
      const signatureMap = new Map(signatures.map((sig) => [sig.id, sig]));

      // 3. Agrupar placements por página para procesamiento eficiente
      const placementsByPage = this.groupPlacementsByPage(placements);

      // 4. Procesar cada página que tiene firmas
      for (const [pageNumber, pagePlacements] of placementsByPage.entries()) {
        // Convertir de número de página (1-based) a índice (0-based)
        const pageIndex = pageNumber - 1;
        const page = pdfDoc.getPage(pageIndex);
        const { width, height } = page.getSize();

        for (const placement of pagePlacements) {
          const signature = signatureMap.get(placement.signatureId);
          if (!signature) continue;

          // Convertir coordenadas relativas a absolutas
          // En PDF, el origen (0,0) está en la esquina inferior izquierda
          // En HTML/Canvas, está en la esquina superior izquierda
          const x = placement.coordinates.x * width;
          const imgWidth = placement.coordinates.width * width;
          const imgHeight = placement.coordinates.height * height;

          // Calcular Y: convertir de top-left (HTML) a bottom-left (PDF)
          // La coordenada Y en PDF es la esquina inferior izquierda de la imagen
          const y = height - placement.coordinates.y * height - imgHeight;

          // Cargar y embedir la imagen
          await this.embedSignature(pdfDoc, page, signature, {
            x,
            y,
            width: imgWidth,
            height: imgHeight,
            rotation: placement.coordinates.rotation || 0,
          });
        }
      }

      // 5. Generar el PDF procesado
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });

      // 6. Generar nombre del archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const baseName = document.name.replace(".pdf", "");
      const fileName = `${baseName}_signed_${timestamp}.pdf`;

      return {
        blob,
        fileName,
        processedAt: new Date(),
      };
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error(
        "Error al procesar el PDF. Por favor, intente nuevamente.",
      );
    }
  }

  /**
   * Embede una firma en una página del PDF
   */
  private async embedSignature(
    pdfDoc: PDFDocument,
    page: ReturnType<PDFDocument["getPage"]>,
    signature: SignatureImage,
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    },
  ): Promise<void> {
    try {
      // Convertir data URL a bytes
      const imageBytes = await this.dataUrlToBytes(signature.dataUrl);

      // Detectar tipo de imagen y embedir
      let image;
      if (signature.file.type === "image/png") {
        image = await pdfDoc.embedPng(imageBytes);
      } else if (
        signature.file.type === "image/jpeg" ||
        signature.file.type === "image/jpg"
      ) {
        image = await pdfDoc.embedJpg(imageBytes);
      } else {
        throw new Error("Formato de imagen no soportado. Use PNG o JPG.");
      }

      // Dibujar la imagen en la página
      if (position.rotation !== 0) {
        // Aplicar rotación usando la función degrees() de pdf-lib
        page.drawImage(image, {
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height,
          rotate: degrees(position.rotation),
        });
      } else {
        // Sin rotación
        page.drawImage(image, {
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height,
        });
      }
    } catch (error) {
      console.error("Error embedding signature:", error);
      throw error;
    }
  }

  /**
   * Convierte un data URL a Uint8Array
   */
  private async dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
    const base64 = dataUrl.split(",")[1];
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  }

  /**
   * Agrupa los placements por número de página
   */
  private groupPlacementsByPage(
    placements: SignaturePlacement[],
  ): Map<number, SignaturePlacement[]> {
    const map = new Map<number, SignaturePlacement[]>();

    for (const placement of placements) {
      const existing = map.get(placement.pageNumber) || [];
      existing.push(placement);
      map.set(placement.pageNumber, existing);
    }

    return map;
  }

  /**
   * Libera recursos (en este caso, no hay recursos persistentes)
   */
  dispose(): void {
    // No hay recursos que liberar en la implementación local
    // Este método existe para mantener la interfaz compatible
    // con futuras implementaciones que puedan necesitar cleanup
  }
}

/**
 * Factory function para crear instancias del procesador local
 */
export function createLocalPdfProcessor(): IPdfProcessor {
  return new LocalPdfProcessor();
}
