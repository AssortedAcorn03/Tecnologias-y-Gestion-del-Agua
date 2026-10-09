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
-- Solo Karla y Patricia son candidatas reales a importarse:
--   · José y Pepe no son del posgrado, pero GAS ya no puede saberlo:
--     están aquí para recordar que la base de la universidad contiene a
--     TODO el alumnado, no solo al de la maestría.
--   · Mónica sí es del posgrado pero está dada de baja → la API la marca
--     no elegible por su estatus.
-- -------------------------------------------------------------
INSERT INTO estudiante
  (clave_alumno, nombre, apellido_paterno, apellido_materno, correo_institucional,
   estatus) VALUES
  (300101, 'José',     'Hernández', 'Castillo', 'jose.hernandez@alumnos.uaslp.mx',
           'Inscrito'),
  (300102, 'Pepe',     'Ramírez',   'Núñez',    'pepe.ramirez@alumnos.uaslp.mx',
           'Inscrito'),
  (300103, 'Karla',    'Guerrero',  'Medina',   'karla.guerrero@alumnos.uaslp.mx',
           'Inscrito'),
  (300104, 'Patricia', 'Soto',      'Álvarez',  'patricia.soto@alumnos.uaslp.mx',
           'Inscrito'),
  (300105, 'Mónica',   'Vázquez',   'Lara',     'monica.vazquez@alumnos.uaslp.mx',
           'Baja')
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
