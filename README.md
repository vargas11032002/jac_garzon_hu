# 🏘️ SistemaJAC — Garzón, Huila

Sistema web multi-tenant de gestión para Juntas de Acción Comunal (JAC) de Garzón, Huila.
Cada junta trabaja con sus propios datos, aislados de las demás.
Desarrollado por **JAV Dev Group**.

Este repositorio es también el objeto de estudio del artículo *Aislamiento de datos y control de
acceso en un sistema web multi-tenant para Juntas de Acción Comunal de Garzón* (ACA, Trabajo de
Grado 3, CUN). Las pruebas de seguridad y sus resultados están en [`pruebas/`](pruebas/LEEME.md).

---

## 🚀 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) y React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL (Neon) con Prisma ORM 7 |
| Autenticación | NextAuth.js 4 (credenciales: administradores y comuneros) |
| Correo | Resend (recuperación de contraseña) |
| Gráficas / PDF | Recharts / @react-pdf/renderer |

---

## 👥 Roles

| Rol | Alcance |
|-----|---------|
| `SUPER_ADMIN` | Alcaldía: ve y administra todas las juntas |
| `PRESIDENTE`, `VICEPRESIDENTE`, `TESORERO`, `FISCAL`, `SECRETARIO` | Directiva de una junta: solo accede a los datos de su propia junta |
| Comunero (afiliado) | Portal personal: consulta su información, calendario y cambia su contraseña |

---

## 📦 Módulos

- **Afiliados**: registro de comuneros, estado de membresía, retiro y cuotas por mes y año.
- **Actas**: actas ordinarias y extraordinarias, orden del día, asistentes y aprobación.
- **Proyectos**: seguimiento de obras e iniciativas, presupuesto y estado.
- **Tesorería**: ingresos, egresos y cuotas vinculadas a transacciones.
- **Comunicados**: avisos, noticias y citaciones.
- **Calendario**: reuniones y eventos de la junta.
- **Juntas y equipo**: alta de juntas y de usuarios administrativos (multi-tenant).
- **Auditoría**: registro de las acciones realizadas por cada usuario.
- **Reportes**: reporte de cuotas en PDF.
- **Portal del comunero** y recuperación de contraseña por correo.

---

## ⚙️ Instalación local

Requisitos: Node.js 20.6 o superior y una base PostgreSQL (se recomienda Neon).

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Editar .env.local: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_APP_URL,
# RESEND_API_KEY y RESEND_FROM_EMAIL (estas dos solo para recuperar contraseña)

# 3. Aplicar migraciones y generar el cliente de Prisma
npx prisma migrate deploy
npx prisma generate

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Base de datos

Modelos (ver `prisma/schema.prisma`): `JAC`, `Afiliado`, `Cuota`, `Acta`, `Proyecto`,
`Transaccion`, `Comunicado`, `Evento`, `AdminUser`, `PasswordResetToken` y `AuditLog`.
Todos los registros de negocio pertenecen a una junta (`jacId`), que es la base del aislamiento
entre juntas.

---

## 🔐 Seguridad y control de acceso

- Cada petición a la API valida la sesión y el rol, y filtra los datos por la junta del usuario.
- Los cuerpos de las solicitudes de edición se sanean (`src/lib/sanitizar.ts`) para impedir
  la asignación masiva (por ejemplo, mover un registro a otra junta con una relación anidada).
- El inicio de sesión del comunero distingue la junta cuando una misma cédula existe en dos juntas.
- Los listados nunca devuelven el hash de la contraseña.
- Limitación conocida: no hay límite de intentos de inicio de sesión (fuerza bruta).
  Se recomienda un límite con almacenamiento compartido (por ejemplo, Redis) antes de producción.

### Pruebas automatizadas de aislamiento

La carpeta `pruebas/` contiene una batería de 136 casos que ataca la API como lo haría un usuario
de una junta contra otra. Resultados de las dos corridas:

| Corrida | Pasa | Falla | Informativos |
|---------|------|-------|--------------|
| Línea base (sin correcciones) | 124 | 8 | 4 |
| Con correcciones (`pruebas/correcciones.patch`) | 131 | 1 | 4 |

Informes: `pruebas/resultados/`. Instrucciones para repetirlas: [`pruebas/LEEME.md`](pruebas/LEEME.md).
Las pruebas usan una base de datos **de pruebas** (`.env.test`, plantilla en `.env.test.example`)
y se niegan a correr contra la base real.

---

## 🗺️ Pendiente / trabajo futuro

- [ ] Límite de intentos de inicio de sesión (H6)
- [ ] Notificaciones por WhatsApp/SMS
- [ ] Pruebas automatizadas integradas en un flujo de integración continua

---

## 👨‍💻 Desarrollado por

**JAV Dev Group** — [jav-dev-group.vercel.app](https://jav-dev-group.vercel.app)
