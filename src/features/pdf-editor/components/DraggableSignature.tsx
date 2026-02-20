/**
 * Componente DraggableSignature
 * Responsabilidad: Permitir arrastrar, redimensionar y rotar firmas sobre el PDF
 * Usa react-rnd para interactividad
 */

"use client";

import { useCallback } from "react";
import { Rnd } from "react-rnd";
import { X, GripVertical, RotateCcw, RotateCw } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { SignaturePlacement, SignatureImage } from "@/core/domain/types";
import type { AbsoluteCoordinates } from "@/core/domain/types";
import {
  absoluteToRelative,
  relativeToAbsolute,
} from "@/core/use-cases/coordinateConverter";
import type { Dimensions } from "@/core/use-cases/coordinateConverter";

interface DraggableSignatureProps {
  placement: SignaturePlacement;
  signature: SignatureImage;
  containerDimensions: Dimensions;
  onUpdate: (placementId: string, updates: Partial<SignaturePlacement>) => void;
  onRemove: (placementId: string) => void;
  isSelected?: boolean;
  onSelect?: (placementId: string) => void;
}

export function DraggableSignature({
  placement,
  signature,
  containerDimensions,
  onUpdate,
  onRemove,
  isSelected = false,
  onSelect,
}: DraggableSignatureProps) {
  /**
   * Convierte coordenadas relativas a absolutas para renderizar
   */
  const absoluteCoords = relativeToAbsolute(
    placement.coordinates,
    containerDimensions,
  );

  /**
   * Handler cuando se arrastra
   */
  const handleDragStop = useCallback(
    (_e: unknown, data: { x: number; y: number }) => {
      const newAbsolute: AbsoluteCoordinates = {
        ...absoluteCoords,
        x: data.x,
        y: data.y,
      };

      const newRelative = absoluteToRelative(newAbsolute, containerDimensions);

      onUpdate(placement.id, {
        coordinates: newRelative,
      });
    },
    [absoluteCoords, containerDimensions, onUpdate, placement.id],
  );

  /**
   * Handler cuando se redimensiona
   */
  const handleResizeStop = useCallback(
    (
      _e: unknown,
      _direction: unknown,
      ref: HTMLElement,
      _delta: unknown,
      position: { x: number; y: number },
    ) => {
      const newAbsolute: AbsoluteCoordinates = {
        x: position.x,
        y: position.y,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
        rotation: placement.coordinates.rotation,
      };

      const newRelative = absoluteToRelative(newAbsolute, containerDimensions);

      onUpdate(placement.id, {
        coordinates: newRelative,
      });
    },
    [
      containerDimensions,
      onUpdate,
      placement.id,
      placement.coordinates.rotation,
    ],
  );

  /**
   * Handler para seleccionar
   */
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect?.(placement.id);
    },
    [onSelect, placement.id],
  );

  /**
   * Handler para eliminar
   */
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove(placement.id);
    },
    [onRemove, placement.id],
  );

  /**
   * Handler para rotar en sentido horario (90 grados)
   */
  const handleRotateClockwise = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentRotation = placement.coordinates.rotation || 0;
      const newRotation = (currentRotation + 90) % 360;

      onUpdate(placement.id, {
        coordinates: {
          ...placement.coordinates,
          rotation: newRotation,
        },
      });
    },
    [onUpdate, placement.id, placement.coordinates],
  );

  /**
   * Handler para rotar en sentido antihorario (-90 grados)
   */
  const handleRotateCounterClockwise = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const currentRotation = placement.coordinates.rotation || 0;
      const newRotation = (currentRotation - 90 + 360) % 360;

      onUpdate(placement.id, {
        coordinates: {
          ...placement.coordinates,
          rotation: newRotation,
        },
      });
    },
    [onUpdate, placement.id, placement.coordinates],
  );

  return (
    <Rnd
      position={{ x: absoluteCoords.x, y: absoluteCoords.y }}
      size={{ width: absoluteCoords.width, height: absoluteCoords.height }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      minWidth={50}
      minHeight={30}
      enableUserSelectHack={false}
      disableDragging={false}
      className={cn(
        "group cursor-move touch-none",
        "border-2 transition-all duration-200",
        isSelected
          ? "border-primary shadow-lg z-10"
          : "border-transparent hover:border-primary/50",
      )}
      onClick={handleClick}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
    >
      {/* Signature Image */}
      <img
        src={signature.dataUrl}
        alt={signature.name}
        className="size-full object-contain pointer-events-none select-none"
        draggable={false}
        style={{
          transform: `rotate(${placement.coordinates.rotation || 0}deg)`,
        }}
      />

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-black/5",
          "opacity-0 group-hover:opacity-100 md:transition-opacity",
          isSelected && "opacity-100",
          "pointer-events-none",
        )}
      >
        {/* Drag Handle */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "bg-primary text-primary-foreground",
            "rounded-md p-2 md:p-1.5",
            "shadow-md",
          )}
        >
          <GripVertical className="size-5 md:size-4" />
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className={cn(
            "absolute -top-4 -right-4 md:-top-3 md:-right-3",
            "bg-destructive text-destructive-foreground",
            "rounded-full p-2 md:p-1.5",
            "shadow-md",
            "hover:scale-110 active:scale-95 transition-transform",
            "cursor-pointer pointer-events-auto",
            "touch-manipulation",
          )}
          type="button"
          aria-label="Eliminar firma"
        >
          <X className="size-5 md:size-4" />
        </button>

        {/* Rotation Buttons */}
        <div className="absolute -top-4 -left-4 md:-top-3 md:-left-3 flex gap-1 pointer-events-auto">
          {/* Rotate Counter-Clockwise */}
          <button
            onClick={handleRotateCounterClockwise}
            className={cn(
              "bg-primary text-primary-foreground",
              "rounded-full p-2 md:p-1.5",
              "shadow-md",
              "hover:scale-110 active:scale-95 transition-transform",
              "cursor-pointer",
              "touch-manipulation",
            )}
            type="button"
            aria-label="Rotar en sentido antihorario"
            title="Rotar 90° izquierda"
          >
            <RotateCcw className="size-5 md:size-4" />
          </button>

          {/* Rotate Clockwise */}
          <button
            onClick={handleRotateClockwise}
            className={cn(
              "bg-primary text-primary-foreground",
              "rounded-full p-2 md:p-1.5",
              "shadow-md",
              "hover:scale-110 active:scale-95 transition-transform",
              "cursor-pointer",
              "touch-manipulation",
            )}
            type="button"
            aria-label="Rotar en sentido horario"
            title="Rotar 90° derecha"
          >
            <RotateCw className="size-5 md:size-4" />
          </button>
        </div>
      </div>

      {/* Corner Resize Indicators */}
      {isSelected && (
        <>
          <div className="absolute -top-1.5 -left-1.5 md:-top-1 md:-left-1 size-4 md:size-3 bg-primary rounded-full" />
          <div className="absolute -top-1.5 -right-1.5 md:-top-1 md:-right-1 size-4 md:size-3 bg-primary rounded-full" />
          <div className="absolute -bottom-1.5 -left-1.5 md:-bottom-1 md:-left-1 size-4 md:size-3 bg-primary rounded-full" />
          <div className="absolute -bottom-1.5 -right-1.5 md:-bottom-1 md:-right-1 size-4 md:size-3 bg-primary rounded-full" />
        </>
      )}
    </Rnd>
  );
}
