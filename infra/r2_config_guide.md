# Guía de Configuración de Cloudflare R2 para Corales

Para que la aplicación funcione correctamente con Cloudflare R2 (específicamente el visor de partituras OSMD y la carga de audios), es necesario configurar las políticas de CORS en el bucket.

## 1. Configuración de CORS

Accede a tu panel de Cloudflare -> R2 -> Tu Bucket -> Settings -> CORS Policy. Añade la siguiente configuración:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://tu-dominio.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

## 2. Variables de Entorno

Asegúrate de configurar las siguientes variables en tu archivo `.env` o en el panel de control (Railway/Vercel):

```bash
STORAGE_MODE=s3
S3_BUCKET=nombre-de-tu-bucket
S3_ACCESS_KEY=tu-access-key
S3_SECRET_KEY=tu-secret-key
S3_ENDPOINT_URL=https://tu-account-id.r2.cloudflarestorage.com
S3_REGION=auto
# Opcional si usas un dominio personalizado para el bucket
# S3_PUBLIC_URL_OVERRIDE=https://pub-xxxx.r2.dev 
```

## 3. Consideraciones de Seguridad

- Usa **API Tokens** específicos para R2 con permisos de "Object Read & Write" solo en el bucket de Corales.
- Las URLs generadas por la aplicación son firmadas (presigned) y expiran por defecto en 1 hora.
