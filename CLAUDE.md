# Sistema de Gestión de Ventas e Inventario

Proyecto final — Laboratorio N.º 16 (Desarrollo de Aplicaciones Web Avanzado).
Entrega y exposición: **4 de julio de 2026**. Desarrollo individual.

Este documento es la fuente de verdad del proyecto. Antes de generar o modificar
código, respeta el alcance, el stack y las convenciones definidas aquí.

---

## 1. Objetivo

Construir y desplegar una aplicación web full-stack para gestionar el inventario y
las ventas de un negocio pequeño, con autenticación, control de acceso por roles y
reportes con gráficos. El énfasis está en un **flujo principal demostrable en vivo**:
registrar una venta que descuenta stock automáticamente y se refleja en los reportes.

## 2. Alcance (MVP)

Entra en el MVP:

- Autenticación con credenciales (email + contraseña) y control por roles.
- CRUD de productos (con categorías y stock) y de clientes.
- Registro de ventas con detalle y descuento automático de stock (transacción).
- Reportes: resumen del dashboard + dos gráficos (ventas por día, productos más vendidos).
- Despliegue en la nube de las tres capas (frontend, backend, base de datos).

Queda **fuera** del MVP (mencionar como "trabajo futuro" en la expo, no implementar):

- Pasarela de pagos real, facturación electrónica, multi-sucursal, multi-moneda.
- OAuth con Google/GitHub: **opcional**. Implementar solo si sobra tiempo tras el MVP.

## 3. Stack tecnológico

| Capa     | Tecnología                                              | Despliegue |
| -------- | ------------------------------------------------------- | ---------- |
| Frontend | Next.js (App Router) + Tailwind + shadcn/ui + Recharts  | Vercel     |
| Auth UI  | NextAuth.js (CredentialsProvider + middleware de rutas) | Vercel     |
| Backend  | Express + Prisma + JWT (jsonwebtoken) + bcrypt          | Render     |
| Base de datos | PostgreSQL                                         | Supabase   |

Reglas técnicas obligatorias:

- **Fijar Prisma en la versión 6** (no instalar la 7). Verificar en `package.json`.
- El backend usa arquitectura por capas: `routes → controllers → services → repositories`.
  Los controladores no acceden a Prisma directamente; eso vive en los repositorios.
- Toda configuración sensible va en variables de entorno; nada hardcodeado en el código.

## 4. Estructura del repositorio (monorepo)

```
ventas-inventario/
├── CLAUDE.md                  # este documento
├── backend/                   # API Express
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js            # roles base + usuario admin + datos demo
│   └── src/
│       ├── config/            # env, cliente Prisma, cors
│       ├── middlewares/       # auth.js (verifica JWT), roles.js, errorHandler.js
│       ├── repositories/      # acceso a datos vía Prisma
│       ├── services/          # lógica de negocio (ej. transacción de venta)
│       ├── controllers/       # req/res, validación de entrada
│       ├── routes/            # define endpoints y aplica middlewares
│       ├── utils/             # firma/verificación de JWT, hash de contraseñas
│       ├── app.js             # crea la app Express, monta rutas y middlewares
│       └── server.js          # arranca el servidor
└── frontend/                  # Next.js (App Router)
    ├── app/                   # rutas y páginas
    ├── components/            # UI (shadcn/ui)
    ├── lib/                   # cliente de API, helpers de sesión
    └── middleware.ts          # protección de rutas con NextAuth
```

Render apunta a `backend/`, Vercel apunta a `frontend/`.

## 5. Roles y permisos

Dos roles. El control se aplica en el backend (middleware `roles.js`) y se refleja en
la UI (ocultar acciones no permitidas).

| Acción                                   | ADMIN | VENDEDOR |
| ---------------------------------------- | :---: | :------: |
| Iniciar sesión / ver dashboard           |   ✔   |    ✔     |
| Ver productos, categorías y clientes     |   ✔   |    ✔     |
| Crear / editar productos y categorías    |   ✔   |    ✘     |
| Eliminar productos (baja lógica)         |   ✔   |    ✘     |
| Crear / editar clientes                  |   ✔   |    ✔     |
| Registrar una venta                      |   ✔   |    ✔     |
| Ver todas las ventas                     |   ✔   |  solo las suyas |
| Anular una venta (repone stock)          |   ✔   |    ✘     |
| Gestionar usuarios y roles               |   ✔   |    ✘     |
| Ver reportes y gráficos                  |   ✔   |    ✔     |

## 6. Módulos y funcionalidades

- **Autenticación**: login, formulario de registro (crea VENDEDOR por defecto),
  bloqueo tras N intentos fallidos, cierre de sesión.
- **Productos**: listado con búsqueda y filtro por categoría, alta/edición, baja lógica
  (`activo = false`), indicador visual de bajo stock.
- **Clientes**: listado y alta/edición; documento (DNI/RUC/CE) único.
- **Ventas**: pantalla tipo punto de venta — elegir cliente, agregar productos con
  cantidad, ver total en vivo; al confirmar, se valida stock, se crea venta + detalle
  y se descuenta stock en una sola transacción.
- **Reportes**: tarjetas de resumen (ventas de hoy, ventas del mes, n.º de ventas,
  productos con bajo stock) y dos gráficos con Recharts.
- **Usuarios** (solo admin): listar usuarios y cambiar su rol.

## 7. Modelo de datos

PostgreSQL, 8 tablas. El esquema canónico está en DBML (abajo); replicarlo tal cual
en `prisma/schema.prisma`.

```dbml
Table roles {
  id     int [pk, increment]
  nombre varchar(30) [not null, unique] // ADMIN, VENDEDOR
}

Table usuarios {
  id              int [pk, increment]
  nombre          varchar(120) [not null]
  email           varchar(160) [not null, unique]
  password        varchar(255)                                    // hash bcrypt; null si OAuth puro
  rol_id          int [not null, ref: > roles.id]
  proveedor       varchar(20) [not null, default: 'credentials']  // credentials | google | github
  failed_attempts int [not null, default: 0]
  locked_until    timestamp
  creado_en       timestamp [not null, default: `now()`]
}

Table cuentas_oauth {
  id                  int [pk, increment]
  usuario_id          int [not null, ref: > usuarios.id]
  proveedor           varchar(20) [not null]                      // google | github
  proveedor_cuenta_id varchar(191) [not null]
  indexes {
    (proveedor, proveedor_cuenta_id) [unique]
  }
}

Table categorias {
  id     int [pk, increment]
  nombre varchar(80) [not null, unique]
}

Table productos {
  id           int [pk, increment]
  nombre       varchar(150) [not null]
  descripcion  text
  precio       decimal(10,2) [not null]
  stock        int [not null, default: 0]
  categoria_id int [ref: > categorias.id]
  activo       boolean [not null, default: true]
  creado_en    timestamp [not null, default: `now()`]
}

Table clientes {
  id        int [pk, increment]
  nombre    varchar(150) [not null]
  tipo_doc  varchar(10) [not null, default: 'DNI']                // DNI | RUC | CE
  num_doc   varchar(20) [not null, unique]
  email     varchar(160)
  telefono  varchar(20)
  creado_en timestamp [not null, default: `now()`]
}

Table ventas {
  id         int [pk, increment]
  cliente_id int [not null, ref: > clientes.id]
  usuario_id int [not null, ref: > usuarios.id]                   // vendedor que registró
  fecha      timestamp [not null, default: `now()`]
  total      decimal(10,2) [not null, default: 0]
  estado     varchar(15) [not null, default: 'COMPLETADA']        // COMPLETADA | ANULADA
}

Table detalle_venta {
  id              int [pk, increment]
  venta_id        int [not null, ref: > ventas.id]
  producto_id     int [not null, ref: > productos.id]
  cantidad        int [not null]
  precio_unitario decimal(10,2) [not null]
  subtotal        decimal(10,2) [not null]
}
```

**Por qué relacional**: integridad referencial (no se puede vender un producto que no
existe), la venta y su detalle se guardan en una transacción atómica que descuenta
stock, y `decimal(10,2)` evita errores de centavos en los montos.

## 8. API REST

Prefijo: `/api`. Todas las rutas (salvo `register` y `login`) exigen JWT válido.

```
Auth
  POST   /api/auth/register        público → crea usuario VENDEDOR
  POST   /api/auth/login           valida bcrypt + lockout, devuelve { user, accessToken }
  GET    /api/auth/me              perfil del usuario autenticado

Usuarios            (ADMIN)
  GET    /api/usuarios
  PATCH  /api/usuarios/:id/rol

Categorías
  GET    /api/categorias           ADMIN, VENDEDOR
  POST   /api/categorias           ADMIN
  PUT    /api/categorias/:id       ADMIN
  DELETE /api/categorias/:id       ADMIN

Productos
  GET    /api/productos            ADMIN, VENDEDOR   (query: q, categoria, page)
  GET    /api/productos/:id        ADMIN, VENDEDOR
  POST   /api/productos            ADMIN
  PUT    /api/productos/:id        ADMIN
  DELETE /api/productos/:id        ADMIN             (baja lógica: activo = false)

Clientes
  GET    /api/clientes             ADMIN, VENDEDOR
  GET    /api/clientes/:id         ADMIN, VENDEDOR
  POST   /api/clientes             ADMIN, VENDEDOR
  PUT    /api/clientes/:id         ADMIN, VENDEDOR
  DELETE /api/clientes/:id         ADMIN

Ventas
  GET    /api/ventas               ADMIN (todas) | VENDEDOR (solo las suyas)
  GET    /api/ventas/:id           ADMIN, VENDEDOR
  POST   /api/ventas               ADMIN, VENDEDOR   (transacción: valida y descuenta stock)
  PATCH  /api/ventas/:id/anular    ADMIN             (repone stock, estado = ANULADA)

Reportes
  GET    /api/reportes/resumen          ADMIN, VENDEDOR
  GET    /api/reportes/ventas-por-dia   ADMIN, VENDEDOR   (query: desde, hasta)
  GET    /api/reportes/top-productos    ADMIN, VENDEDOR
```

## 9. Autenticación y seguridad

- NextAuth vive en el frontend solo como capa de **sesión y orquestación**. El backend
  Express es quien autentica de verdad.
- Flujo de login: el `CredentialsProvider` de NextAuth llama a `POST /api/auth/login`.
  Express verifica la contraseña con bcrypt, controla el bloqueo por intentos fallidos
  (`failed_attempts`, `locked_until`) y, si es válido, firma un **JWT (HS256)** con
  `userId` y `rol`. NextAuth guarda ese token en la sesión (estrategia JWT).
- Cada llamada del frontend a la API lleva `Authorization: Bearer <accessToken>`.
- En Express, `middlewares/auth.js` verifica el token y `middlewares/roles.js` valida
  el rol antes del controlador.
- `middleware.ts` en Next.js protege las rutas privadas (redirige a `/login` sin sesión).
- Contraseñas siempre con bcrypt (nunca texto plano). Validar entradas y devolver
  errores con códigos HTTP coherentes (400, 401, 403, 404, 409).

## 10. Variables de entorno

Backend (`backend/.env`), nunca commitear:

```
DATABASE_URL=postgresql://...        # cadena de Supabase (usar pooler en producción)
JWT_SECRET=...
PORT=4000
CORS_ORIGIN=https://<tu-app>.vercel.app
MAX_LOGIN_ATTEMPTS=5
LOCK_MINUTES=15
```

Frontend (`frontend/.env.local`):

```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://<tu-app>.vercel.app
API_URL=https://<tu-api>.onrender.com    # base del backend Express
# Opcionales (solo si se implementa OAuth):
# GOOGLE_CLIENT_ID= / GOOGLE_CLIENT_SECRET=
# GITHUB_ID= / GITHUB_SECRET=
```

Incluir un `.env.example` en cada carpeta con las claves vacías.

## 11. Despliegue

1. **Supabase**: crear proyecto, copiar la `DATABASE_URL`. Para Prisma en producción usar
   la URL del pooler (puerto 6543). En desarrollo desde TECSUP, la red bloquea los puertos
   de base de datos → usar hotspot móvil o el pooler.
2. **Render** (backend): build `npm install && npx prisma generate && npx prisma migrate deploy`,
   start `node src/server.js`. Cargar las variables de entorno del backend.
3. **Vercel** (frontend): root = `frontend/`. Cargar variables del frontend.
4. Cuadrar URLs cruzadas: `CORS_ORIGIN` = URL de Vercel; `NEXTAUTH_URL` = URL de Vercel;
   `API_URL` = URL de Render.

## 12. Flujo de la demo (exposición)

1. Login como **admin** → dashboard con métricas y gráficos.
2. Crear o editar un producto; mostrar el control de stock.
3. Ir a **nueva venta**: elegir cliente, agregar productos, ver el total calcularse.
4. Confirmar la venta → mostrar cómo baja el stock del producto vendido.
5. Abrir **reportes** → el gráfico ya refleja la venta recién hecha.
6. Cerrar sesión y entrar como **vendedor** → mostrar que las acciones de admin no aparecen.

## 13. Criterios de aceptación (rúbrica)

**A. Producto funcional**

- [ ] App desplegada y accesible (Vercel + Render + Supabase).
- [ ] Autenticación funcionando con dos roles diferenciados.
- [ ] Variables de entorno y `.env.example`; sin secretos en el repo.

**B. Diseño técnico**

- [ ] Modelo E-R del esquema relacional.
- [ ] Diagrama de arquitectura (frontend ↔ backend ↔ base de datos).
- [ ] Justificación de la elección relacional.

**C. Presentación**

- [ ] Demostración en vivo del flujo principal sin errores.
- [ ] Explicación del flujo cliente-servidor (cómo se comunican Next.js y Express).
- [ ] Desafíos encontrados y cómo se resolvieron.

## 14. Cronograma (17 jun → 4 jul)

| Días  | Entregable                                                        |
| ----- | ----------------------------------------------------------------- |
| 1–2   | Repo, `schema.prisma`, migración a Supabase, auth (login/registro + roles) |
| 3–5   | CRUD de productos, categorías y clientes                          |
| 6–8   | Módulo de ventas con transacción y descuento de stock             |
| 9–10  | Reportes + gráficos                                               |
| 11–12 | Roles en el frontend, pulir UI                                    |
| 13–14 | Desplegar las tres capas, variables de entorno, pruebas end-to-end |
| 15–16 | Diagramas finales y guion de exposición + ensayo                  |
