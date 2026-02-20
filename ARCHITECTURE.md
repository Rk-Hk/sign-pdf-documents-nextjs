# Documento de Arquitectura de Software: Sistema de Firma de PDFs (SaaS Ready)

## 1. Resumen Ejecutivo

Este documento define la arquitectura para una aplicación web enfocada en la firma digital e inserción de imágenes (PNG) en documentos PDF. El proyecto adopta una estrategia evolutiva: inicia como un MVP centrado en la **Privacidad por Diseño** (procesamiento 100% en el cliente, uso anónimo), y sienta las bases estructurales para escalar hacia un modelo **SaaS (Software as a Service)** con suscripciones, autenticación y almacenamiento en la nube, utilizando un único repositorio full-stack.

## 2. Principios Arquitectónicos

- **Privacy by Design (Fase 1)**: Cero transferencia de datos sensibles al servidor. Los documentos se procesan en la memoria RAM del navegador del usuario.
- **Arquitectura Evolutiva**: El código está preparado para migrar de un procesamiento puramente local a uno basado en la nube mediante inyección de dependencias, sin reescribir la lógica de negocio.
- **SEO & Rendimiento First**: Utilización de SSR (Server-Side Rendering) y SSG (Static Site Generation) para las páginas públicas, garantizando alta indexabilidad y tiempos de carga óptimos.
- **Single Source of Truth**: Unificación del ecosistema en un monorepo full-stack para compartir tipados estandarizados entre el cliente, la API y la base de datos.

## 3. Topología del Sistema

El sistema evoluciona en dos fases claramente diferenciadas pero sobre la misma base de código.

### Fase 1: MVP (Procesamiento Local)

El servidor solo entrega la aplicación web optimizada. El navegador del cliente asume el trabajo criptográfico y de manipulación del archivo.

### Fase 2: SaaS (Suscripciones y Almacenamiento)

Se activan las API Routes del framework para gestionar pagos, sesiones y el almacenamiento persistente mediante el ORM.

## 4. Stack Tecnológico

- **Framework Core**: **Next.js (App Router)**. Centraliza el enrutamiento, la optimización SEO y expone endpoints backend (Route Handlers) en el mismo proyecto.
- **Lenguaje**: **TypeScript** estricto en todo el stack.
- **Diseño de Sistema (UI)**: **Tailwind CSS** combinado con **shadcn/ui**. Esto permite construir un Design System propio, accesible y escalable, sin la sobrecarga de librerías de componentes pesadas.
- **Motor PDF (Frontend)**:
  - **Renderizado**: `react-pdf` (Carga dinámica `next/dynamic` con `ssr: false`).
  - **Interactividad**: `react-rnd` (Drag, Drop, Resize, Rotate).
  - **Procesamiento Core**: `pdf-lib` (Ejecutado localmente).
- **Base de Datos y ORM (Fase 2)**: **PostgreSQL** orquestado mediante **Prisma ORM** por su tipado robusto y migraciones seguras.
- **Despliegue e Integración Continua (CI/CD)**: Pipelines automatizados con **GitHub Actions** para garantizar la calidad del código (Linting, Type Checking) antes de cualquier despliegue en entornos Cloud.
- **Infraestructura Local**: **Docker / Docker Compose** para encapsular el entorno de base de datos durante el desarrollo.

## 5. Patrones de Diseño y Buenas Prácticas

Para garantizar que el código sea mantenible y soporte la transición hacia la Fase 2, se implementarán los siguientes patrones:

### Patrón Estrategia (Strategy Pattern) para el Procesamiento

- Se define una interfaz `IPdfProcessor`.
- **MVP**: Implementación de `LocalPdfProcessor` (ejecuta `pdf-lib` en el navegador).
- **SaaS**: Implementación futura de `CloudPdfProcessor` (envía payloads a Next.js API Routes).

### Aislamiento de Entornos (Client vs Server)

- Separación estricta usando directivas `'use client'` y `'use server'`. Las operaciones del DOM y el uso del `<canvas>` estarán rigurosamente aisladas de los componentes renderizados en el servidor para evitar errores de hidratación.

### Conversión Geométrica Relativa

- La captura de coordenadas en el frontend se abstraerá de resoluciones de pantalla absolutas. Se calcularán las transformaciones (X, Y, Escala) como porcentajes relativos a las dimensiones originales del PDF, garantizando precisión sin importar el dispositivo del usuario.

## 6. Proyección de Base de Datos (Fase 2 - SaaS)

El esquema relacional base (Prisma) estará preparado desde el día 1, aunque no se utilice en el flujo de usuarios anónimos del MVP:

- **User**: Gestiona la autenticación y el nivel de suscripción (`Role: FREE | PREMIUM`).
- **Document**: Almacena metadatos y URLs de objetos en el Cloud Storage (ej. AWS S3) para usuarios de pago.
- **SignatureTemplate**: Permite a usuarios premium guardar múltiples firmas (PNGs) y sus preferencias de estampado por defecto.

## 7. Alcance Estricto del MVP

- **Incluido**:
  - Landing page optimizada (SEO).
  - Subida anónima de PDF y PNG en RAM.
  - Interfaz visual interactiva para posicionar la firma.
  - Botón de procesamiento y descarga local.
  - Mensajería explícita de "Privacidad Total".
  - Pipeline básico de GitHub Actions.
- **Excluido (Diferido a V2)**:
  - Registro de usuarios.
  - Pasarelas de pago.
  - Bases de datos en producción.
  - Almacenamiento de archivos en la nube.

## 8. Estructura de Directorios (Feature-Based & Clean Architecture Lite)

El proyecto adoptará una estructura modular orientada a características (Feature-Based). Esto garantiza que, a medida que el monolito crezca (añadiendo autenticación o pasarelas de pago), el código se mantenga cohesivo y el acoplamiento sea mínimo.

Las reglas de dependencia serán estrictas: las capas superiores (`app`) pueden importar de las inferiores (`features`, `core`, `shared`), pero no a la inversa.

```bash
/pdf-signer-next
├── /prisma                  # (Fase 2) Esquema de base de datos y migraciones
├── /public                  # Assets estáticos y Web Workers (ej. pdf.js worker)
│
├── /src
│   ├── /app                 # 1. Capa de Enrutamiento (Next.js App Router)
│   │   ├── /api             # (Fase 2) Route Handlers / Controladores HTTP
│   │   ├── layout.tsx       # Root layout, inyección de Providers globales
│   │   └── page.tsx         # Landing page (Server Component puro para SEO)
│   │
│   ├── /core                # 2. Capa de Dominio (Clean Architecture / Agnóstico a React)
│   │   ├── /domain          # Entidades e Interfaces (Los "Puertos" hexagonales)
│   │   │   ├── types.ts     # Tipados globales (ej. Document, Coordinates)
│   │   │   └── IPdfProcessor.ts # Contrato que cualquier procesador PDF debe cumplir
│   │   └── /use-cases       # Casos de uso puros (ej. CalculateRelativeCoordinates)
│   │
│   ├── /features            # 3. Capa de Características (Feature-Based)
│   │   ├── /pdf-editor      # Módulo principal del MVP
│   │   │   ├── /components  # Componentes de UI específicos (PdfViewer, DraggableSignature)
│   │   │   ├── /hooks       # Lógica de estado de React (usePdfEditor)
│   │   │   └── /services    # Los "Adaptadores" (LocalPdfProcessor implementa IPdfProcessor)
│   │   │
│   │   ├── /auth            # (Fase 2) Módulo de Autenticación
│   │   └── /billing         # (Fase 2) Módulo de Suscripciones
│   │
│   └── /shared              # 4. Capa Compartida (Recursos transversales)
│       ├── /components      # UI Reutilizable
│       │   ├── /ui          # Componentes atómicos de shadcn/ui (Button, Dialog, Toast)
│       │   └── /layouts     # Navbar, Footer genéricos
│       ├── /lib             # Utilidades genéricas (función `cn` para Tailwind, formateadores)
│       └── /hooks           # Hooks globales (useMediaQuery, useClickOutside)
│
├── middleware.ts            # (Fase 2) Edge middleware para proteger rutas premium
├── tailwind.config.ts       # Configuración del Design System
└── package.json             # Dependencias del proyecto
```

### Justificación Técnica y Clean Code

- **Aislamiento del Core (Principio de Inversión de Dependencias)**: La carpeta `/core` no sabrá qué es React ni Next.js. Al definir `IPdfProcessor.ts` en `/core/domain` y colocar la implementación de `pdf-lib` en `/features/pdf-editor/services`, logramos que la lógica de negocio dependa de abstracciones, no de detalles concretos. Esto hace que el código sea altamente testeable mediante pruebas unitarias puras en Jest/Vitest.

- **Encapsulamiento de Features**: Todo lo que concierne a la edición de PDFs vive dentro de `/features/pdf-editor`. Si en el futuro hay un bug en el visor de PDF, el desarrollador sabe exactamente a qué carpeta ir, sin tener que navegar por un mar de componentes globales.

- **El Directorio `/shared` para el Design System**: Al aislar `shadcn/ui` en `/shared/components/ui`, creamos un límite claro entre los componentes de negocio y los componentes visuales "tontos" (Dumb Components). Esto fomenta la reutilización y la consistencia visual, principios fundamentales del Clean Code en el Frontend.