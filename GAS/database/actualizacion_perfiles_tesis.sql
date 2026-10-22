-- Ejecutar una vez sobre la base GAS existente. No elimina datos.
CREATE TABLE IF NOT EXISTS tesis_seguimiento (
 id_tesis INT PRIMARY KEY,
 resumen VARCHAR(1000) NOT NULL DEFAULT '',
 resolucion VARCHAR(30) NULL,
 dictamen TEXT NULL,
 fecha_resolucion DATETIME NULL,
 usuario_resolucion INT NULL,
 FOREIGN KEY (id_tesis) REFERENCES tesis(id_tesis),
 FOREIGN KEY (usuario_resolucion) REFERENCES usuario(id_usuario)
);
INSERT INTO CAT_estado_tesis(nombre,descripcion)
SELECT 'No aceptada','Tesis con resolución final no favorable'
WHERE NOT EXISTS(SELECT 1 FROM CAT_estado_tesis WHERE nombre='No aceptada');
-- Vincula cuentas Profesor existentes por su clave institucional/RPE.
-- No cambia nombres de profesores que ya existen ni reasigna RPE ocupados.
INSERT INTO profesor(rpe,nombre)
SELECT CAST(u.clave_institucional AS UNSIGNED),LEFT(u.nombre,50)
FROM usuario u JOIN CAT_rol_usuario r ON r.id_rol_usuario=u.id_rol_usuario
WHERE r.nombre='Profesor' AND u.clave_institucional REGEXP '^[1-9][0-9]{0,8}$'
AND NOT EXISTS(SELECT 1 FROM profesor p WHERE p.rpe=CAST(u.clave_institucional AS UNSIGNED));
INSERT INTO profesor_detalle(rpe,id_usuario,correo_institucional,activo)
SELECT p.rpe,u.id_usuario,u.correo,u.activo
FROM usuario u JOIN CAT_rol_usuario r ON r.id_rol_usuario=u.id_rol_usuario
JOIN profesor p ON CAST(p.rpe AS CHAR)=u.clave_institucional
WHERE r.nombre='Profesor' AND NOT EXISTS(SELECT 1 FROM profesor_detalle d WHERE d.rpe=p.rpe OR d.id_usuario=u.id_usuario);

UPDATE profesor_detalle d JOIN usuario u ON CAST(d.rpe AS CHAR)=u.clave_institucional
JOIN CAT_rol_usuario r ON r.id_rol_usuario=u.id_rol_usuario
SET d.id_usuario=u.id_usuario,d.correo_institucional=u.correo,d.activo=u.activo
WHERE r.nombre='Profesor' AND d.id_usuario IS NULL;

-- Recupera vínculos de alumnos existentes solo por matrícula exacta y rol Alumno.
UPDATE alumno a JOIN usuario u ON u.clave_institucional=CAST(a.clave_alumno AS CHAR)
JOIN CAT_rol_usuario r ON r.id_rol_usuario=u.id_rol_usuario
LEFT JOIN alumno otro ON otro.id_usuario=u.id_usuario
SET a.id_usuario=u.id_usuario
WHERE a.id_usuario IS NULL AND otro.clave_alumno IS NULL AND r.nombre='Alumno';
