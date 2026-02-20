/**
 * Use Case: Conversión de Coordenadas
 * Lógica de negocio pura sin dependencias de React o del DOM
 * Convierte entre coordenadas absolutas (píxeles) y relativas (porcentajes)
 */

import type { AbsoluteCoordinates, RelativeCoordinates } from "../domain/types";

/**
 * Dimensiones del contenedor/página
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Convierte coordenadas absolutas (píxeles) a relativas (0-1)
 * Esto hace que las posiciones sean independientes del tamaño de pantalla
 */
export function absoluteToRelative(
  absolute: AbsoluteCoordinates,
  containerDimensions: Dimensions,
): RelativeCoordinates {
  return {
    x: absolute.x / containerDimensions.width,
    y: absolute.y / containerDimensions.height,
    width: absolute.width / containerDimensions.width,
    height: absolute.height / containerDimensions.height,
    rotation: absolute.rotation,
  };
}

/**
 * Convierte coordenadas relativas (0-1) a absolutas (píxeles)
 * Usado para renderizar en el canvas del navegador
 */
export function relativeToAbsolute(
  relative: RelativeCoordinates,
  containerDimensions: Dimensions,
): AbsoluteCoordinates {
  return {
    x: relative.x * containerDimensions.width,
    y: relative.y * containerDimensions.height,
    width: relative.width * containerDimensions.width,
    height: relative.height * containerDimensions.height,
    rotation: relative.rotation,
  };
}

/**
 * Valida que las coordenadas relativas estén dentro de los límites [0, 1]
 */
export function validateRelativeCoordinates(
  coords: RelativeCoordinates,
): boolean {
  return (
    coords.x >= 0 &&
    coords.x <= 1 &&
    coords.y >= 0 &&
    coords.y <= 1 &&
    coords.width > 0 &&
    coords.width <= 1 &&
    coords.height > 0 &&
    coords.height <= 1 &&
    coords.x + coords.width <= 1 &&
    coords.y + coords.height <= 1
  );
}

/**
 * Ajusta las coordenadas para mantenerlas dentro de los límites
 */
export function constrainCoordinates(
  coords: RelativeCoordinates,
): RelativeCoordinates {
  const x = Math.max(0, Math.min(1 - coords.width, coords.x));
  const y = Math.max(0, Math.min(1 - coords.height, coords.y));
  const width = Math.min(1 - x, coords.width);
  const height = Math.min(1 - y, coords.height);

  return {
    x,
    y,
    width,
    height,
    rotation: coords.rotation,
  };
}
