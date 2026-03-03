/**
 * Componente PdfEditorWorkspace
 * Responsabilidad: Orquestar todo el flujo del editor de PDF
 * Componente Smart que consume usePdfEditor
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
} from "lucide-react";
import { usePdfEditor } from "../hooks/usePdfEditor";
import { FileUploader } from "./FileUploader";
import { DraggableSignature } from "./DraggableSignature";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";

// Cargar PdfViewer solo en el cliente
const PdfViewer = dynamic(
  () => import("./PdfViewer").then((mod) => ({ default: mod.PdfViewer })),
  { ssr: false },
);

export function PdfEditorWorkspace() {
  const editor = usePdfEditor();
  const [pdfDimensions, setPdfDimensions] = useState({
    width: 800,
    height: 1000,
  });
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfWidth, setPdfWidth] = useState(800);

  useEffect(() => {
    const calculatePdfWidth = () => {
      const viewportWidth = window.innerWidth;

      // Padding del container (px-3 md:px-4)
      const containerPadding = viewportWidth >= 768 ? 32 : 24; // md breakpoint

      // Max width del container (max-w-7xl = 1280px)
      const maxContainerWidth = 1280;
      const actualContainerWidth = Math.min(
        viewportWidth - containerPadding,
        maxContainerWidth,
      );

      // En desktop (lg: 1024px+), hay sidebar de 400px + gap de 24px
      if (viewportWidth >= 1024) {
        const sidebarWidth = 400;
        const gap = 24;
        const pdfAreaWidth = actualContainerWidth - sidebarWidth - gap;
        setPdfWidth(pdfAreaWidth);
      } else {
        // En mobile/tablet, usa todo el ancho disponible
        setPdfWidth(actualContainerWidth);
      }
    };

    calculatePdfWidth();

    window.addEventListener("resize", calculatePdfWidth);
    return () => window.removeEventListener("resize", calculatePdfWidth);
  }, []);

  /**
   * Handler para cuando se carga el PDF
   */
  const handlePdfPageLoad = useCallback(
    (dimensions: { width: number; height: number }) => {
      setPdfDimensions(dimensions);
    },
    [],
  );

  /**
   * Handler para agregar firma al PDF
   */
  const handleAddSignatureToPage = useCallback(
    (signatureId: string) => {
      if (!editor.pdfDocument) return;
      editor.addPlacement(signatureId, editor.currentPage);
    },
    [editor],
  );

  /**
   * Handler para procesar y descargar el PDF
   */
  const handleProcessAndDownload = useCallback(async () => {
    try {
      setIsProcessing(true);
      const result = await editor.processPdf();

      // Crear link de descarga
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.fileName;
      link.click();

      // Limpiar
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [editor]);

  /**
   * Obtiene los placements de la página actual
   */
  const currentPagePlacements = editor.placements.filter(
    (p) => p.pageNumber === editor.currentPage,
  );

  return (
    <div className="container mx-auto py-4 md:py-8 px-3 md:px-4 max-w-7xl">
      {/* Header */}
      <header className="mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
              Editor de Firmas PDF (v2)
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Firma tus documentos de forma segura y privada
            </p>
          </div>
          <Badge variant="outline" className="gap-2 shrink-0">
            <Shield className="size-4" />
            100% Privado
          </Badge>
        </div>
      </header>

      {/* Error Alert */}
      {editor.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{editor.error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-4 md:gap-6">
        {/* Left Column: PDF Viewer */}
        <div className="order-2 lg:order-1 space-y-3 md:space-y-4">
          {!editor.pdfDocument ? (
            <Card className="p-4 md:p-8">
              <FileUploader
                accept=".pdf"
                onFileSelect={editor.uploadPdf}
                disabled={editor.status === "pdf-loading"}
                label="Arrastra tu PDF aquí o haz clic para seleccionar"
                description="Selecciona el documento que deseas firmar"
                maxSizeMB={25}
              />
            </Card>
          ) : (
            <>
              {/* PDF Canvas */}
              <Card className="p-2 md:p-4 bg-muted/20">
                <div
                  className="relative mx-auto overflow-x-auto"
                  style={{ width: "fit-content", maxWidth: "100%" }}
                >
                  {/* PDF Viewer */}
                  <PdfViewer
                    document={editor.pdfDocument}
                    pageNumber={editor.currentPage}
                    onPageLoad={handlePdfPageLoad}
                    width={pdfWidth}
                  />

                  {/* Draggable Signatures Overlay */}
                  <div
                    className="absolute top-0 left-0"
                    style={{
                      width: pdfDimensions.width,
                      height: pdfDimensions.height,
                    }}
                  >
                    {currentPagePlacements.map((placement) => {
                      const signature = editor.signatures.find(
                        (s) => s.id === placement.signatureId,
                      );
                      if (!signature) return null;

                      return (
                        <DraggableSignature
                          key={placement.id}
                          placement={placement}
                          signature={signature}
                          containerDimensions={pdfDimensions}
                          onUpdate={editor.updatePlacement}
                          onRemove={editor.removePlacement}
                          isSelected={selectedPlacementId === placement.id}
                          onSelect={setSelectedPlacementId}
                        />
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* Page Navigation */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={editor.prevPage}
                  disabled={editor.currentPage === 1}
                  className="md:size-default"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline ml-1">Anterior</span>
                </Button>

                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                  Página {editor.currentPage} de {editor.pdfDocument.pageCount}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={editor.nextPage}
                  disabled={editor.currentPage === editor.pdfDocument.pageCount}
                  className="md:size-default"
                >
                  <span className="hidden sm:inline mr-1">Siguiente</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <aside className="order-1 lg:order-2 space-y-3 md:space-y-4">
          {/* Upload Signature */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="size-5" />
              Tus Firmas
            </h3>

            {editor.signatures.length === 0 ? (
              <FileUploader
                accept="image/png,image/jpeg,image/jpg"
                onFileSelect={editor.addSignature}
                disabled={editor.status === "signature-loading"}
                label="Sube tu firma"
                description="PNG o JPG con fondo transparente"
                maxSizeMB={5}
              />
            ) : (
              <div className="space-y-3">
                {editor.signatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={signature.dataUrl}
                      alt={signature.name}
                      className="size-16 object-contain bg-white rounded border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {signature.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(signature.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddSignatureToPage(signature.id)}
                      disabled={!editor.pdfDocument}
                      className="touch-manipulation"
                    >
                      Agregar
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/png,image/jpeg,image/jpg";
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) editor.addSignature(file);
                    };
                    input.click();
                  }}
                >
                  + Agregar otra firma
                </Button>
              </div>
            )}
          </Card>

          {/* Process Button */}
          {editor.pdfDocument && (
            <Card className="p-4">
              <Button
                className="w-full touch-manipulation"
                size="lg"
                onClick={handleProcessAndDownload}
                disabled={!editor.canProcess || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Progress value={50} className="mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Download className="size-5 mr-2" />
                    Descargar PDF Firmado
                  </>
                )}
              </Button>

              {editor.placements.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {editor.placements.length} firma(s) colocada(s)
                </p>
              )}
            </Card>
          )}

          {/* Privacy Notice */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex gap-3">
              <Shield className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Privacidad Total</h4>
                <p className="text-xs text-muted-foreground">
                  Todos los documentos se procesan localmente en tu navegador.
                  Nunca enviamos tu información a nuestros servidores.
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
