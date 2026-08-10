# 🌐 Social Network - Frontend Client

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Progressive_Web_App-5A0FC8?style=for-the-badge&logo=pwa)

> **Nota:** Este repositorio contiene únicamente el cliente Frontend. El código de la API (Backend) se encuentra en [Social Network API](https://github.com/[TU_USUARIO]/red-social-back).

## 📌 Descripción del Proyecto

Aplicación web progresiva (PWA) construida con Angular que funciona como cliente para una red social completa. 

El sistema está diseñado con un fuerte enfoque en la experiencia de usuario (UX) y el rendimiento. Implementa consumo avanzado de APIs RESTful, manejo de estado global, seguridad de rutas basada en roles (Usuario/Administrador) y sincronización de sesiones mediante JWT (JSON Web Tokens).

---

## 🚀 Funcionalidades Principales

*   **Autenticación y Seguridad:** Flujo de Login/Registro completo. Manejo de JWT en memoria local con interceptores HTTP para enviar el token en cada petición y lógica de "Refresh Token" automático antes de su vencimiento (15 min).
*   **Feed Dinámico:** Listado de publicaciones con **Scroll Infinito** para una carga de datos eficiente y optimizada.
*   **Interacción Social:** Sistema de *Likes*, comentarios paginados con botón de "Cargar más", y la capacidad de guardar, compartir y editar contenido propio.
*   **Dashboard Administrativo:** Panel exclusivo protegido por `Guards` con gestión de usuarios (Altas/Bajas lógicas) y visualización de métricas a través de gráficos dinámicos (Charts).
*   **PWA Integrada:** La aplicación puede instalarse en dispositivos móviles y de escritorio, ofreciendo una experiencia nativa.

---

## 🛠️ Arquitectura y Angular Features

*   **Pipes & Directivas Custom:** Implementación de al menos 3 directivas y 3 pipes propias para el formateo de datos en tiempo real y manipulación del DOM.
*   **Interceptors:** Intercepción de respuestas HTTP para captura global de errores (401 Unauthorized, 400 Bad Request) y redirecciones automáticas.
*   **Guards:** Protección estricta de rutas basada en la carga del payload del token.

---

## ⚙️ Instalación y Entorno Local

1. Clonar el repositorio: `git clone https://github.com/[TU_USUARIO]/red-social-front.git`
2. Instalar dependencias: `npm install`
3. Configurar la URL de la API en `src/environments/environment.ts`.
4. Ejecutar: `ng serve`