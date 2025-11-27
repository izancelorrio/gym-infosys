# Memoria de Funciones, Endpoints y Flujos — Gym-Infosys

> Documento en formato Markdown listo para guardar en la memoria de proyecto.

## Introducción
Breve resumen: este documento enumera las funcionalidades disponibles por perfil (`usuario`, `cliente`, `entrenador`, `admin`), mapea cada función a los endpoints relevantes (método + ruta) y describe paso a paso los flujos más importantes del sistema (registro, verificación, recuperación de contraseña, contratación de plan, asignación/desasignación de entrenadores y reserva de clases).

---

**Formato**
- **Perfil**: lista de funcionalidades (breve descripción).
- **Mapeo de endpoints**: listados por funcionalidad con `HTTP METHOD` + `RUTA` y descripción.
- **Flujos paso a paso**: pasos numerados, verificaciones, y puntos de fallo comunes.

---

## 1) Funcionalidades por perfil

**Usuario (no autenticado / visitante):**
- **Ver planes**: consultar `GET /planes` para ver los planes disponibles.
- **Registro**: `POST /register` — crear cuenta básica (email, contraseña, nombre).
- **Login**: `POST /login` — obtener sesión / token.
- **Ver video promocional**: abrir modal cliente en la UI (no requiere endpoint).
- **Recuperar contraseña**: iniciar `POST /send-reset-email`.

**Cliente (autenticado con rol cliente):**
- **Completar/editar perfil**: `PUT /cliente/{id}` — actualizar datos personales, contacto.
- **Contratar plan**: `POST /contract-plan` — contratar o renovar un plan.
- **Reservas de clases**: `GET /reservas` y `POST /reservas` — listar y crear reservas.
- **Ver clases programadas**: `GET /clases-programadas` — consultar agenda.
- **Registrar ejercicio/actividad**: `POST /registrar-ejercicio` — guardar actividad/ejercicio realizado.
- **Ver estadísticas personales**: `GET /cliente/{id}/estadisticas` — datos de uso, asistencia, progreso.
- **Ver entrenamientos asignados**: `GET /cliente/{id}/entrenamientos-asignados`.

**Entrenador (autenticado con rol entrenador):**
- **Ver clientes asignados**: `GET /entrenador/{id}/clientes` — lista de clientes a su cargo.
- **Asignar entrenamiento a cliente**: `POST /entrenador/{entrenador_id}/cliente/{cliente_id}/plan-entrenamiento` — crear plan/ejercicio.
- **Ver estadísticas del cliente**: `GET /entrenador/estadisticas/{cliente_id}` (alias) — ver progreso del cliente.
- **Marcar asistencia / registrar sesiones**: endpoints de sesión/entrenamiento (según implementación interna).
- **Ver clases/gimnasio**: `GET /gym-clases`, `GET /clases-programadas`.

**Admin (autenticado con rol admin):**
- **Gestión de usuarios**: `GET /admin/users`, `PUT /admin/users/{id}`, `DELETE /admin/users/{id}` — CRUD de usuarios.
- **Asignación de entrenadores**: `GET /asignaciones-entrenador`, `POST /asignar-entrenador`, `DELETE /desasignar-entrenador/{id}`.
- **Estadísticas globales**: `GET /admin/estadisticas` — agregados por clientes, entrenadores y uso.
- **Gestión de planes y clases**: endpoints para crear/editar `planes`, `gym-clases`, `clases-programadas`.
- **Seed / mantenimiento**: scripts y endpoints para mantenimiento en `API/postgres/*` (DDL/seed).

---

## 2) Mapeo de funciones → Endpoints (resumen práctico)

- **Registro de usuario**: `POST /register` — crea usuario con estado "pendiente" de verificación y envía email.
- **Verificación de email**: `GET /verify-email?token=...` o `POST /verify-email` — valida token y activa cuenta.
- **Login**: `POST /login` — devuelve sesión/token.
- **Enviar email de recuperación**: `POST /send-reset-email` — genera token y envía link.
- **Resetear contraseña**: `POST /reset-password` — aplica nueva contraseña con token.
- **Cambiar contraseña**: `POST /change-password` — operación autenticada para cambiar contraseña actual.

- **Planes**:
  - `GET /planes` — lista de planes.
  - `POST /planes` — (admin) crear plan.
  - `PUT /planes/{id}` — (admin) actualizar plan.

- **Contractar plan (cliente)**:
  - `POST /contract-plan` — crea contrato/registro de plan para cliente.

- **Reservas y clases**:
  - `GET /gym-clases` — lista de tipos de clases.
  - `GET /clases-programadas` — calendario/agenda.
  - `POST /reservas` — crear reserva (verifica cupo y duplicados).
  - `GET /reservas` — listar reservas del usuario.

- **Asignaciones entrenador-cliente**:
  - `GET /asignaciones-entrenador` — lista asignaciones (admin view).
  - `POST /asignar-entrenador` — crear asignación (body: `entrenador_id`, `cliente_id`, `notas`).
  - `DELETE /desasignar-entrenador/{id}` — elimina asignación por id.
  - `GET /entrenador/{id}/clientes` — clientes asignados al entrenador.

- **Estadísticas / contadores**:
  - `GET /admin/estadisticas` — métricas globales (clientes, entrenadores, reservas, etc.).
  - `GET /cliente/{id}/estadisticas` — métricas de cliente (asistencias, calorías, sesiones realizadas).
  - `GET /entrenador/estadisticas/{cliente_id}` — (alias) métricas del cliente para entrenador.
  - `GET /count-members` — contador de miembros.
  - `GET /count-trainers` — contador de entrenadores.

- **Operaciones administrativas adicionales**:
  - `GET /admin/users` — listar usuarios.
  - `PUT /admin/users/{id}` — actualizar usuario (roles, estado).
  - `DELETE /admin/users/{id}` — borrar usuario.

> Nota: Las rutas concretas pueden variar en detalle en el código; este mapeo se ha construido a partir de las rutas observadas en `API/main.py` y el código front-end. Si necesitas un mapeo exhaustivo línea-por-línea del fichero `API/main.py`, puedo generar uno exacto.

---

## 3) Flujos clave (paso a paso, con comprobaciones y puntos de fallo comunes)

### A) Registro y verificación de email
1. Cliente envía `POST /register` con `{email, password, nombre, ...}`.
2. Backend valida datos (formato email, contraseña mínima).
3. Se crea fila `users` con `is_active=false` (o `verified=false`).
4. Backend genera `verification_token` y lo guarda en tabla `email_verifications` o similar con `user_id` y `expires_at`.
5. Backend envía email con enlace `https://.../verify-email?token=...`.
6. Usuario hace clic en el enlace → UI envía `GET/POST /verify-email` con token.
7. Backend valida token (existencia y no expirado), marca `user.verified=true` y borra el token.
8. Posibles fallos:
   - Token expirado → pedir reenvío (`POST /resend-verification`).
   - Email duplicado en registro → rechazo en `POST /register`.

### B) Recuperar contraseña (reset)
1. Usuario solicita `POST /send-reset-email` con su `email`.
2. Backend valida existencia del email; genera `reset_token` y lo guarda con `expires_at`.
3. Email con link `https://.../reset-password?token=...` enviado al usuario.
4. Usuario abre link y proporciona nueva contraseña `POST /reset-password` + token.
5. Backend valida token, actualiza contraseña (hash), borra token y confirma.
6. Posibles fallos:
   - Token inválido/expirado → error y reintento del flujo.
   - Políticas de contraseña no cumplidas.

### C) Contratar un plan (cliente)
1. Cliente autenticado solicita `POST /contract-plan` con `plan_id` y datos de pago (o selecciona modalidad gratuita).
2. Backend valida plan disponible (`GET /planes`), verifica que el cliente no tenga conflicto de planes activos.
3. Se crea registro en `contracts` / `customer_plans` con `start_date`, `expiry_date`, `status`.
4. Se registra la transacción (si aplica) y se notifica al cliente.
5. Posibles fallos:
   - Plan no existe o no disponible.
   - Error en proceso de pago (si aplica) → rollback y notificación.

### D) Asignar / Desasignar entrenador (Admin)
Asignar:
1. Admin selecciona entrenador y cliente en UI y pulsa asignar.
2. Frontend envía `POST /asignar-entrenador` con `{entrenador_id, cliente_id, notas}`.
3. Backend verifica que ambos existan y no haya asignación duplicada.
4. Inserta fila en `trainer_client_assignments` (o tabla equivalente) y devuelve la nueva asignación.
5. Frontend actualiza columnas (mover cliente de "sin asignar" a "asignados").
6. Posibles fallos:
   - Asignación ya existente → devolver 409 o mensaje explicativo.
   - FK inválido → 400.

Desasignar:
1. Admin hace `DELETE /desasignar-entrenador/{assignment_id}` (o la UI envía id de asignación).
2. Backend elimina la fila correspondiente (o marca inactivo si se conserva histórico).
3. Frontend actualiza UI moviendo cliente a "sin asignar".
4. Posibles fallos:
   - Assignment id no existe → 404.
   - Dependencias (por ejemplo, sesiones programadas) requieren validación previa.

### E) Reserva de clase (Cliente)
1. Usuario autentificado solicita `POST /reservas` con `{clase_programada_id, cliente_id}`.
2. Backend valida: existencia de `clase_programada`, cupo disponible y que el cliente no tenga reserva duplicada para la misma clase.
3. Inserta la reserva y decrementa o registra ocupación.
4. Retorna confirmación con `reservation_id`.
5. Posibles fallos:
   - Cupo lleno → 409 con mensaje "cupo completo".
   - Reserva duplicada → 409.

### F) Entrenador asigna entrenamiento / plan a cliente
1. Entrenador abre UI de cliente y crea plan: `POST /entrenador/{entrenador_id}/cliente/{cliente_id}/plan-entrenamiento` con ejercicios y sesiones.
2. Backend valida que el entrenador está asignado al cliente (si la regla lo exige).
3. Inserta plan y ejercicios en las tablas correspondientes (`workouts`, `workout_sessions`, `workout_exercises`).
4. Cliente ve el plan en `GET /cliente/{id}/entrenamientos-asignados`.
5. Posibles fallos:
   - Entrenador no asignado al cliente (403) si la política lo requiere.
   - Datos de ejercicio inválidos.

### G) Actualizar usuario (Admin) — flujo seguro / transaccional
1. Admin envía `PUT /admin/users/{id}` con cambios (rol, email, datos personales).
2. Backend abre transacción; valida cambios (p. ej., rol a `entrenador` requiere crear fila en `trainers` si procede).
3. Aplica cambios y hace commit.
4. Si ocurre error intermedio (p. ej. constraint violation), hace rollback y devuelve error claro.
5. Punto clave: evitar savepoint/rollback anidados mal manejados — usar transacciones atómicas y reintentar selectos si es necesario.

---

## 4) Puntos de integración y comprobaciones recomendadas para testing
- Probar `POST /asignar-entrenador` seguido de `DELETE /desasignar-entrenador/{id}` para asegurarse de que el frontend refleja correctamente los cambios.
- Probar el flujo de `send-reset-email` → `reset-password` con un token caducado y con token válido.
- Validar que `GET /cliente/{id}/estadisticas` devuelve las métricas esperadas cuando hay datos reales en `workout_sessions` y `reservas`.
- Revisar que las rutas que retornan listas incluyen paginación o límites si la tabla es grande.

---

## 5) Siguientes pasos sugeridos (opcional)
- Generar un mapeo exacto por línea de `API/main.py` (función → ruta → archivo/posición) si necesitas una referencia de trazabilidad para auditoría.
- Añadir un `docs/openapi-mapping.md` o extraer el OpenAPI desde `main.py` para documentación automática.
- Añadir tests automáticos para los flujos críticos (registro, asignar/desasignar, reservar).

---

## Referencias rápidas (archivos relevantes)
- `API/main.py` — implementa la mayoría de endpoints y lógica de negocio.
- `app/admin/asignaciones/page.tsx` — UI del administrador para asignaciones (3 columnas, búsquedas, toasts).
- `components/promotional-video-modal.tsx` — modal del video promocional en la UI pública.
- `API/postgres/ddl_postgres.sql` y `API/postgres/seed_postgres.sql` — DDL y seeds de ejemplo.

---

Si quieres, puedo:
- Extraer automáticamente todas las rutas de `API/main.py` y listarlas con firma precisa.
- Añadir un `README_MEMORIA.md` al repositorio (ya lo he guardado en `docs/memoria_funciones_por_perfil.md`).
- Generar checklists de pruebas manuales para QA.

Fin del documento.
