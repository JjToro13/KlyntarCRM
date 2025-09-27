# KlyntarCRM 🕸️

CRM en desarrollo inspirado en los simbiontes **Klyntar (Marvel)**.  
Proyecto full-stack con **React (frontend)** + **Node/Express + Prisma (backend)**.

---

## 🚀 Requisitos

- [Node.js 20+](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- [Git](https://git-scm.com/downloads)
- (Opcional) [VS Code](https://code.visualstudio.com/)

---

## 📂 Estructura

```
KlyntarCRM/
├─ frontend/   # React + Vite + TS
├─ backend/    # Express + Prisma + SQLite
└─ .gitignore
```

---

## 🔧 Configuración inicial

1. Clonar repositorio:

```bash
git clone https://github.com/TuUsuario/KlyntarCRM.git
cd KlyntarCRM
```

2. Instalar dependencias:

```bash
pnpm install
```

3. Configurar variables de entorno en `backend/.env`:

```ini
DATABASE_URL="file:./dev.db"
JWT_SECRET="klyntar-super-secreto"
PORT=3001
```

---

## ⚙️ Backend

### Inicializar base de datos

Entra a la carpeta `backend/`:

```bash
cd backend
pnpm run prisma:push
pnpm run prisma:generate
```

### Crear usuario admin inicial

```bash
pnpm run seed
```

Esto crea el usuario:

```
email: admin@klyntarcrm.local
password: Admin123!
```

### Levantar servidor

```bash
pnpm run dev
```

- API: [http://localhost:3001](http://localhost:3001)  
- Salud: [http://localhost:3001/health](http://localhost:3001/health)

---

## 🔑 Endpoints actuales

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@klyntarcrm.local",
  "password": "Admin123!"
}
```

➡️ Devuelve un **JWT** válido por 7 días.

### Usuario actual

```http
GET /me
Authorization: Bearer <TOKEN>
```

➡️ Devuelve la información del usuario autenticado.

---

## 🎨 Frontend

1. Entra a la carpeta `frontend/`:

```bash
cd frontend
pnpm install
pnpm dev
```

2. Abre en navegador: [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Scripts útiles

### Backend
- `pnpm run dev` → levanta servidor con Nodemon
- `pnpm run seed` → crea usuario admin
- `pnpm run prisma:push` → aplica schema a la DB
- `pnpm run prisma:generate` → genera cliente Prisma

### Frontend
- `pnpm dev` → entorno de desarrollo
- `pnpm build` → compila para producción
- `pnpm preview` → servidor de preview

---

## 📌 Próximos pasos

- [ ] Conectar frontend al backend (pantalla de login).
- [ ] CRUD de usuarios/agentes desde API.
- [ ] Gestión de leads con importación de CSV.
- [ ] Reglas de reparto de leads a agentes.
- [ ] Panel admin + panel agente.

---

## 📜 Licencia

Proyecto en desarrollo. Todos los derechos reservados © 2025.
