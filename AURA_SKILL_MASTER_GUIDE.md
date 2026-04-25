# 🛡️ AuraSkill: Master Architecture Guide

AuraSkill es una plataforma de mentoría en tiempo real diseñada con una estética **Cyber-Luxury** y una arquitectura de seguridad de grado profesional. Este documento detalla cómo funciona la plataforma "bajo el capó".

---

## 🚀 1. Stack Tecnológico (The Engine)

### **Frontend Core**
*   **React 19**: Biblioteca principal para la interfaz de usuario.
*   **Vite**: Herramienta de compilación ultra rápida para desarrollo moderno.
*   **React Router DOM v7**: Gestión de navegación y protección de rutas.

### **Comunicación y Tiempo Real**
*   **Socket.io Client**: Conexión bidireccional para el chat y actualizaciones en vivo de las salas.
*   **Axios / Fetch (HttpClient)**: Cliente personalizado para peticiones API con soporte de seguridad.

### **Estética y UI**
*   **Lucide React**: Set de iconos modernos y consistentes.
*   **SweetAlert2**: Sistema de notificaciones y alertas elegantes.
*   **Vanilla CSS**: Diseño a medida con variables neón y efectos de cristalería (Glassmorphism).

---

## 🔒 2. Capas de Seguridad (The Shield)

AuraSkill implementa múltiples capas de seguridad para proteger los datos de los usuarios:

### **A. Autenticación via HttpOnly Cookies**
*   **XSS Protection**: El token JWT ya no se guarda en el navegador (localStorage). Se almacena en una cookie `HttpOnly`, lo que significa que es invisible para los scripts maliciosos.
*   **Validación Silenciosa**: Al cargar la web, se realiza una verificación automática con el servidor (`/auth/profile`) para restaurar la sesión.

### **B. Ofuscación de IDs en URL**
*   **URL Masking**: Los IDs de base de datos (ej: `15`) se transforman en códigos alfanuméricos (ej: `YXVyYS1...`) usando un algoritmo de **Base64 con Salt**. Esto evita que usuarios malintencionados adivinen IDs de salas privadas.

### **C. Almacenamiento Cifrado**
*   **AES Encryption**: Los datos de la UI (nombre, rol) se guardan en `sessionStorage` cifrados con **CryptoJS**. Si alguien inspecciona el almacenamiento del navegador, verá datos ilegibles.

---

## 👥 3. Roles y Permisos

| Característica | Alumno (Aprendiz) | Mentor |
| :--- | :---: | :---: |
| **Explorar Mentores** | ✅ Sí | ✅ Sí |
| **Unirse a Salas** | ✅ Sí | ✅ Sí |
| **Crear Salas** | ❌ No | ✅ Sí |
| **Cerrar Salas** | ❌ No | ✅ Sí (Solo propias) |
| **Ver Historial** | ✅ Propio | ✅ Propio |
| **Panel de Estadísticas** | ❌ No | ✅ Sí |

---

## 🔄 4. Flujos Principales

### **1. Registro e Inicio**
1.  **Registro**: Formulario optimizado sin scroll (Nombre, Usuario, Correo, Password).
2.  **Login**: El servidor responde con la cookie segura. El frontend guarda el perfil en el estado global.
3.  **App Mount**: El "Guardian de Sesión" en `App.jsx` verifica la validez de la cookie antes de renderizar rutas protegidas.

### **2. Mentoría (Flujo de Sala)**
1.  **Creación**: El mentor crea una sala. El ID se genera en el backend.
2.  **Difusión**: La sala aparece en "Salas Activas" para todos.
3.  **Conexión**: Al entrar, la URL se ofusca automáticamente. El `RoomPage` decodifica el ID y conecta via WebSockets para interactividad total.

### **3. Protección de Rutas**
*   Cualquier intento de acceder a `/home`, `/perfil` o `/sala` sin una sesión válida redirige automáticamente a `/login`.
*   Si un Alumno intenta entrar a `/salas-activas` (panel de mentor), el sistema lo redirige a la página de **No Autorizado**.

---

## 📂 5. Estructura de Archivos Clave
*   `src/services/httpClient.js`: El cerebro de las comunicaciones API.
*   `src/utils/obfuscation.js`: La lógica de "hasheo" de URLs.
*   `src/hooks/useAuth.js`: El hook maestro de autenticación.
*   `src/App.jsx`: El guardián global y ruteador.

---

> **AuraSkill**: *Aprender nunca fue tan seguro ni tan elegante.* 🛡️✨
