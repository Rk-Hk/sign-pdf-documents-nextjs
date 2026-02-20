# 📝 Sign Documents

> Firma tus documentos PDF de forma segura y 100% privada. Todo el procesamiento ocurre en tu navegador.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tech Stack](#-tech-stack)
- [Arquitectura](#-arquitectura)
- [Inicio Rápido](#-inicio-rápido)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Desarrollo](#-desarrollo)
- [Roadmap - Fase 2](#-roadmap---fase-2)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### **🔒 Privacy by Design**
Todo el procesamiento se realiza localmente en el navegador del usuario. Ningún documento es enviado a servidores externos.

### **📄 Firma de PDFs**
- Carga documentos PDF de hasta 25MB
- Sube una o múltiples imágenes de firma (PNG/JPG)
- Visualización página por página con navegación

### **🎨 Editor Interactivo**
- **Drag & Drop**: Arrastra y coloca firmas sobre el documento
- **Resize**: Ajusta el tamaño de la firma con controles intuitivos
- **Rotate**: Rota la firma en incrementos de 90° (sentido horario y antihorario)
- **Delete**: Elimina firmas con un solo clic
- **Touch-friendly**: Optimizado para dispositivos móviles con controles táctiles

### **📱 Responsive Design**
- Adaptación automática a todos los tamaños de pantalla
- Breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)
- PDF viewer adaptativo según el viewport

### **🎯 Experiencia de Usuario**
- Procesamiento en tiempo real sin latencia de red
- Descarga inmediata del PDF firmado
- Interfaz limpia y profesional con diseño Trust & Authority
- Sin registro ni autenticación requerida (Fase 1 - MVP)

---

## 🛠 Tech Stack

### **Frontend Framework**
- **Next.js 16.1.6** - App Router con Server/Client Components
- **React 19** - Biblioteca UI con hooks modernos
- **TypeScript 5** - Type safety estricto

### **Styling**
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Componentes reutilizables (New York variant)
- **Lucide React** - Iconografía consistente
- **Design System** - Trust & Authority theme (EB Garamond + Lato)

### **PDF Processing**
- **pdf-lib 1.17.1** - Manipulación de PDFs en el cliente
- **react-pdf 10.3.0** - Renderizado de PDFs en React
- **pdfjs-dist 5.4.624** - Worker de PDF.js

### **Interactividad**
- **react-rnd 10.5.2** - Drag, resize y posicionamiento de elementos
- **uuid 13.0.0** - Generación de IDs únicos

### **Tooling**
- **pnpm** - Package manager rápido y eficiente
- **ESLint** - Linting con configuración strict
- **PostCSS** - Procesamiento de CSS

---

## 🏗 Arquitectura

Este proyecto implementa **Clean Architecture** con **Feature-Based Structure** para máxima escalabilidad y mantenibilidad.

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                 │
│    (src/app, src/features/*/components)        │
│  ┌───────────────────────────────────────────┐ │
│  │   React Components (Smart & Dumb)         │ │
│  │   - PdfEditorWorkspace (Orchestrator)     │ │
│  │   - PdfViewer, DraggableSignature, etc.   │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│             Application Layer                    │
│         (src/features/*/hooks)                  │
│  ┌───────────────────────────────────────────┐ │
│  │   Custom Hooks (State Management)         │ │
│  │   - usePdfEditor() → Business logic       │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              Domain Layer                        │
│           (src/core/domain)                     │
│  ┌───────────────────────────────────────────┐ │
│  │   Entities & Interfaces                    │ │
│  │   - types.ts → Domain models              │ │
│  │   - IPdfProcessor → Strategy pattern      │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│           Infrastructure Layer                   │
│       (src/features/*/services)                 │
│  ┌───────────────────────────────────────────┐ │
│  │   Implementations                          │ │
│  │   - LocalPdfProcessor → pdf-lib wrapper   │ │
│  │   - coordinateConverter → Use cases       │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### **Principios Aplicados**

- **Dependency Inversion**: Los componentes dependen de abstracciones (interfaces), no de implementaciones
- **Single Responsibility**: Cada módulo tiene una única razón para cambiar
- **Strategy Pattern**: `IPdfProcessor` permite cambiar la implementación sin afectar el resto
- **Feature-Based**: Código organizado por características (`pdf-editor`), no por tipo técnico

---

## 🚀 Inicio Rápido

### **Prerrequisitos**

- Node.js 18+ o 20+
- pnpm 8+ (recomendado) o npm

### **Instalación**

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/sign-documents-front.git
cd sign-documents-front

# Instalar dependencias con pnpm
pnpm install

# O con npm
npm install
```

### **Desarrollo**

```bash
# Iniciar servidor de desarrollo
pnpm dev

# La aplicación estará disponible en:
# http://localhost:3000
```

### **Build de Producción**

```bash
# Generar build optimizado
pnpm build

# Iniciar servidor de producción
pnpm start
```

---

## 📁 Estructura del Proyecto

```
sign-documents-front/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Layout raíz con fonts y metadata
│   │   ├── page.tsx                  # Página principal (monta PdfEditorWorkspace)
│   │   └── globals.css               # Estilos globales + Design System
│   │
│   ├── core/                         # Clean Architecture - Domain Layer
│   │   ├── domain/
│   │   │   ├── types.ts              # Entidades del dominio
│   │   │   └── IPdfProcessor.ts      # Interface para Strategy Pattern
│   │   └── use-cases/
│   │       └── coordinateConverter.ts # Lógica de negocio pura
│   │
│   ├── features/                     # Feature-Based Structure
│   │   └── pdf-editor/               # Feature: Editor de PDFs
│   │       ├── index.ts              # Barrel export
│   │       ├── components/           # Componentes de UI
│   │       │   ├── PdfEditorWorkspace.tsx    # Orchestrator (Smart)
│   │       │   ├── PdfViewer.tsx             # Visualizador (Dumb)
│   │       │   ├── DraggableSignature.tsx    # Control de firma (Dumb)
│   │       │   └── FileUploader.tsx          # Uploader (Dumb)
│   │       ├── hooks/
│   │       │   └── usePdfEditor.ts   # State management + business logic
│   │       └── services/
│   │           └── LocalPdfProcessor.ts # Implementación de IPdfProcessor
│   │
│   └── shared/                       # Código compartido
│       ├── components/
│       │   └── ui/                   # shadcn/ui components
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── alert.tsx
│       │       └── ...
│       └── lib/
│           └── utils.ts              # Utilidades (cn, etc.)
│
├── design-system/                    # Especificaciones de diseño
│   └── sign-documents/
│       ├── MASTER.md                 # Guía de estilo global
│       └── pages/                    # Specs específicas por página
│
├── public/                           # Assets estáticos
├── components.json                   # Configuración de shadcn/ui
├── tailwind.config.ts                # Configuración de Tailwind
├── tsconfig.json                     # Configuración de TypeScript
└── package.json                      # Dependencias y scripts
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Servidor de desarrollo (http://localhost:3000)
pnpm build        # Build de producción optimizado
pnpm start        # Servidor de producción
pnpm lint         # Ejecutar ESLint

# Utilidades
pnpm type-check   # Verificar tipos de TypeScript (si está configurado)
```

---

## 💻 Desarrollo

### **Agregar Nuevos Componentes shadcn/ui**

```bash
npx shadcn@latest add [component-name]

# Ejemplos:
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

### **Convenciones de Código**

- **Componentes**: PascalCase (`PdfViewer.tsx`)
- **Hooks**: camelCase con prefijo "use" (`usePdfEditor.ts`)
- **Types**: PascalCase (`PdfDocument`, `SignaturePlacement`)
- **CSS Variables**: kebab-case con prefijo (`--color-primary`)
- **Comentarios JSDoc**: Para funciones públicas y componentes exportados

### **Patterns Utilizados**

- **Strategy Pattern**: `IPdfProcessor` permite cambiar la implementación (ej: de local a cloud)
- **Custom Hooks**: Encapsulan lógica de estado y side effects
- **Compound Components**: Componentes que trabajan juntos (`PdfEditorWorkspace` + children)
- **Render Props**: Para componentes flexibles y reutilizables

### **Consideraciones de Performance**

- `dynamic()` import para `PdfViewer` (ssr: false)
- `useCallback` para handlers pasados como props
- `useMemo` para cálculos costosos (si aplica)
- Debounced resize events (usando `ResizeObserver` cuando es posible)

---

## 🗺 Roadmap - Fase 2

La Fase 1 (MVP) está completa. Las siguientes features están planificadas para Fase 2:

### **Autenticación**
- [ ] Integración con AWS Cognito
- [ ] Login social (Google, Microsoft)
- [ ] Gestión de sesiones con JWT

### **Persistencia**
- [ ] Base de datos PostgreSQL con Prisma ORM
- [ ] Almacenamiento de documentos firmados en S3/CloudFlare R2
- [ ] Historial de documentos por usuario

### **Suscripciones**
- [ ] Modelo Freemium con Stripe
- [ ] Planes: Free (5 docs/mes), Pro (ilimitado)
- [ ] Portal de facturación

### **Features Avanzadas**
- [ ] Firmas múltiples (workflows de aprobación)
- [ ] Templates de documentos
- [ ] API pública para integraciones
- [ ] Webhooks para notificaciones

### **Stack Adicional (Fase 2)**
- **ORM**: Prisma + PostgreSQL
- **Autenticación**: AWS Cognito
- **Pagos**: Stripe
- **Storage**: AWS S3 / CloudFlare R2
- **Deploy**: Vercel + AWS

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### **Guías de Contribución**

- Sigue las convenciones de código existentes
- Agrega tests si introduces nueva lógica
- Actualiza la documentación según sea necesario
- Mantén los commits atómicos y descriptivos

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.


<div align="center">
  <p>Hecho con Clean Architecture y Next.js</p>
  <p>
    <a href="#-sign-documents">Volver arriba ⬆️</a>
  </p>
</div>
