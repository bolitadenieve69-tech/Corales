# Guía de Pruebas y Despliegue: Corales MVP

¡Felicidades! La fase inicial (MVP) de la aplicación **Corales** ya está completamente implementada. A continuación encontrarás las instrucciones paso a paso para probarla de manera local y para desplegarla en un entorno de producción (ej. Vercel para frontend y Railway/Render para backend).

---

## 🧪 1. Pruebas Locales

Para probar toda la integración de la app localmente, asegúrate de levantar ambos servidores (Frontend y Backend).

### Paso 1: Levantar el Backend (FastAPI)

El backend maneja la autenticación, base de datos SQLite y gestión de archivos.

1. Abre una terminal y navega al directorio del backend:

   ```bash
   cd apps/api
   ```

2. Activa tu entorno virtual (si tienes uno) e instala dependencias (si no lo has hecho):

   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Ejecuta las migraciones de Alembic para asegurar que la DB esté actualizada:

   ```bash
   alembic upgrade head
   ```

4. Levanta el servidor en el puerto 8000:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. *(Opcional)* Visita `http://127.0.0.1:8000/docs` para ver la documentación interactiva (Swagger) de los endpoints creados.

### Paso 2: Levantar el Frontend (Next.js)

El frontend contiene la interfaz de usuario para Directores y Coralistas.

1. Abre una nueva terminal y navega al directorio del frontend:

   ```bash
   cd apps/web
   ```

2. Instala las dependencias y corre el servidor de desarrollo:

   ```bash
   npm install
   npm run dev
   ```

3. Abre tu navegador en **`http://localhost:3000`**.

### Paso 3: Flujos a Probar en Local

Te sugerimos probar los siguientes flujos críticos:

1. **Acceso / Creación de Coro**: Entra a `/login` o explora el mock initial.
2. **Biblioteca Privada (Director)**:
   - Ve a `/library` y haz clic en "Añadir Obra Privada".
   - Rellena el formulario con datos de una obra, marca la confirmación de derechos, selecciona un PDF o MP3 ligero y envíalo. Verifica que te redirige y que la obra fue añadida.
3. **Gestión de Proyectos**:
   - Accede a `/projects` y visualiza un proyecto (ej. clic en el mock Project 1).
   - Debe aparecer la barra del "Progreso Global del Coro".
4. **Catálogo y Estudio (Coralista)**:
   - Ve al detalle de una obra (`/library/1` por ejemplo).
   - Verifica el UI del reproductor.
   - Selecciona "En Progreso" o "Dominada" y verifica que tu progreso se ha guardado correctamente en backend y que la interfaz muestra un ticket de alerta exitosa.

---

## 🚀 2. Guía de Despliegue (Producción)

Dado que es un MVP dividido en frontend (Next.js React) y backend (Python FastAPI), recomendamos plataformas especializadas.

### 2.1 Backend (Railway, Render o VPS Pila)

Actualmente, el backend usa SQLite. Al desplegar, debes considerar cambiar a PostgreSQL (modificando `DATABASE_URL` en `api/database.py`).

1. **Plataforma recomendada (Railway)**: Conecta el repositorio de GitHub. Configura el directorio raíz `apps/api`.
2. Comando de inicio (Start Command):

   ```bash
   alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. **Persistencia de Archivos**: Los archivos se suben temporalmente en disco. En producción, es altamente recomendable conectar MinIO o AWS S3 para las partituras y audios (Phase 8 futura).
4. Asegúrate de añadir un archivo `.env` o variables de entorno con configuraciones críticas (`SECRET_KEY`, `ALGORITHM`, `DATABASE_URL`).

### 2.2 Frontend (Vercel)

El frontend en Next.js App Router (Turbopack) está optimizado nativamente para [Vercel](https://vercel.com).

1. Importa tu proyecto Git en Vercel.
2. Como el proyecto es un **Monorepo**, dile a Vercel que la "Root Directory" es `apps/web`.
3. El build command es automático (`npm run build`). Se ha comprobado recientemente que **compila con Exit code 0**.
4. En las variables de entorno de Vercel, deberás configurar algo como `NEXT_PUBLIC_API_URL=https://api-corales.railway.app` y reemplazar todos los `http://127.0.0.1:8000` por esta variable en los fetch.

*(Importante: En el código actual hay llamadas HTTP hardcodeadas a `http://127.0.0.1:8000`. Antes de hacer push definitivo a producción, debes reemplazarlas por el uso de la variable de entorno)*.
