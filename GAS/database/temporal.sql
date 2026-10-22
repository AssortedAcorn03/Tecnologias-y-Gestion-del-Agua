-- =============================================================
-- TEMPORAL — Sustituto de la base de datos de la universidad
--
-- Esta NO es la base del proyecto, y su nombre lo dice: es desechable.
-- Hace de doble local de la base institucional, de la que GAS solo LEE
-- para importar alumnos. El día de la implantación se apunta la cadena
-- de conexión a la base real de la universidad, este esquema se borra
-- y este archivo deja de hacer falta. Nada del código depende del
-- nombre `TEMPORAL`: vive solo en la cadena de conexión.
--
-- Requiere privilegios de administrador (crea esquema y usuario):
--   sudo mysql < database/temporal.sql
-- =============================================================

-- Se tira y se vuelve a crear en cada ejecución, a propósito: así el script
-- es idempotente y basta volver a correrlo tras cualquier cambio de estructura.
-- Es seguro porque este esquema solo contiene datos de prueba inventados.
-- NO pongas aquí el nombre de ningún esquema con información real.
DROP DATABASE IF EXISTS TEMPORAL;
CREATE DATABASE TEMPORAL
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE TEMPORAL;
SET NAMES utf8mb4;

-- -------------------------------------------------------------
-- La tabla se llama `estudiante`, NO `alumno`, a propósito: son
-- esquemas distintos y nadie debe intentar un JOIN entre ellos.
--
-- Solo está lo que GAS usa de verdad, nada más:
--   · las 5 columnas que se copian al importar el alumno;
--   · `estatus`, que NO se copia: solo avisa de que esa clave existe
--     pero está dada de baja en la universidad.
--
-- Deliberadamente NO hay CURP, fecha de nacimiento, sexo, facultad,
-- fecha de alta ni nivel de estudios: la base real los tendrá, pero GAS
-- no los lee. Tampoco el programa academico: el de nuestro catalogo lo
-- asigna el coordinador al importar.
--
-- Consecuencia de no guardar el nivel de estudios: GAS no puede saber si
-- una clave pertenece al posgrado o a una licenciatura. Eso lo sabe quien
-- teclea las claves.
-- -------------------------------------------------------------
CREATE TABLE estudiante (
  clave_alumno         INT PRIMARY KEY,          -- 6 cifras, asignada por la universidad
  nombre               VARCHAR(50)  NOT NULL,
  apellido_paterno     VARCHAR(50)  NOT NULL,
  apellido_materno     VARCHAR(50),
  correo_institucional VARCHAR(100) NOT NULL,

  -- No se copia; solo avisa de si el registro sigue vigente
  estatus              VARCHAR(20),              -- Inscrito | Egresado | Baja

  UNIQUE KEY uq_estudiante_correo (correo_institucional)
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- Datos de ejemplo
--
-- Quince estudiantes. El correo institucional sigue el formato que asigna
-- la universidad: A + clave de alumno + @alumnos.uaslp.mx
--
--   · Mónica (300105) y Hugo (300114) están dados de baja → la API los
--     marca no elegibles por su estatus.
--   · Paola (300113) figura como egresada → sí es elegible: el estatus solo
--     bloquea la baja, y una egresada puede tener expediente en el posgrado.
--   · Itzel (300115) no tiene apellido materno → ejercita la columna nula
--     en toda la cadena.
-- -------------------------------------------------------------
INSERT INTO estudiante
  (clave_alumno, nombre, apellido_paterno, apellido_materno, correo_institucional,
   estatus) VALUES
  (300101, 'José', 'Hernández', 'Castillo', 'A300101@alumnos.uaslp.mx', 'Inscrito'),
  (300102, 'Pepe', 'Ramírez', 'Núñez', 'A300102@alumnos.uaslp.mx', 'Inscrito'),
  (300103, 'Karla', 'Guerrero', 'Medina', 'A300103@alumnos.uaslp.mx', 'Inscrito'),
  (300104, 'Patricia', 'Soto', 'Álvarez', 'A300104@alumnos.uaslp.mx', 'Inscrito'),
  (300105, 'Mónica', 'Vázquez', 'Lara', 'A300105@alumnos.uaslp.mx', 'Baja'),
  (300106, 'Diego', 'Martínez', 'Robles', 'A300106@alumnos.uaslp.mx', 'Inscrito'),
  (300107, 'Fernanda', 'Ortiz', 'Delgado', 'A300107@alumnos.uaslp.mx', 'Inscrito'),
  (300108, 'Luis', 'Campos', 'Treviño', 'A300108@alumnos.uaslp.mx', 'Inscrito'),
  (300109, 'Alejandra', 'Zúñiga', 'Peña', 'A300109@alumnos.uaslp.mx', 'Inscrito'),
  (300110, 'Ricardo', 'Salazar', 'Ibarra', 'A300110@alumnos.uaslp.mx', 'Inscrito'),
  (300111, 'Mariana', 'Cervantes', 'Aguilar', 'A300111@alumnos.uaslp.mx', 'Inscrito'),
  (300112, 'Sergio', 'Villalobos', 'Nájera', 'A300112@alumnos.uaslp.mx', 'Inscrito'),
  (300113, 'Paola', 'Esquivel', 'Mendoza', 'A300113@alumnos.uaslp.mx', 'Egresado'),
  (300114, 'Hugo', 'Barrera', 'Quintero', 'A300114@alumnos.uaslp.mx', 'Baja'),
  (300115, 'Itzel', 'Lozano', NULL, 'A300115@alumnos.uaslp.mx', 'Inscrito')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre), apellido_paterno = VALUES(apellido_paterno),
  apellido_materno = VALUES(apellido_materno), estatus = VALUES(estatus);

-- -------------------------------------------------------------
-- Usuario de solo lectura para GAS
--
-- El GRANT es sobre la TABLA, no sobre el esquema: mínimo privilegio
-- real, y es lo que un DBA universitario entregaría.
--
-- El usuario de la aplicación (`admin`) conserva CERO permisos aquí,
-- por diseño. Esa separación es comprobable:
--   mysql -u admin -p -e "SELECT 1 FROM TEMPORAL.estudiante"
--   → ERROR 1142/1044 Access denied
--
-- Cambia la contraseña antes de ejecutar. Se escribe una sola vez: el usuario
-- se recrea en cada ejecución porque `CREATE USER IF NOT EXISTS` NO actualiza
-- la contraseña de un usuario que ya existe, y eso deja el secreto del backend
-- apuntando a una clave que ya no es la del archivo.
-- -------------------------------------------------------------
DROP USER IF EXISTS 'gas_lectura'@'localhost';
CREATE USER 'gas_lectura'@'localhost' IDENTIFIED BY 'Admin1234?';
GRANT SELECT ON TEMPORAL.estudiante TO 'gas_lectura'@'localhost';
FLUSH PRIVILEGES;

-- -------------------------------------------------------------
-- Verificación
-- -------------------------------------------------------------
SELECT clave_alumno, nombre, apellido_paterno, estatus FROM estudiante ORDER BY clave_alumno;
SHOW GRANTS FOR 'gas_lectura'@'localhost';
