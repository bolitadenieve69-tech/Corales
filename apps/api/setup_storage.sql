-- 1. Crear el Bucket público llamado 'assets'
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir que TODO EL MUNDO (público) pueda ver/descargar los archivos
CREATE POLICY "Public Read Access on assets" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'assets' );

-- 3. Permitir que un usuario AUTENTICADO pueda subir archivos
CREATE POLICY "Authenticated Users can upload to assets" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'assets' AND auth.role() = 'authenticated' );

-- 4. Permitir actualizar sus propios archivos si lo necesitan
CREATE POLICY "Authenticated Users can update assets"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'assets' AND auth.role() = 'authenticated' );

-- 5. Permitir borrar (opcional, pero útil para gestión)
CREATE POLICY "Authenticated Users can delete assets"
ON storage.objects FOR DELETE
USING ( bucket_id = 'assets' AND auth.role() = 'authenticated' );
