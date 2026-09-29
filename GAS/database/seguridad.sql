-- Ejecutar UNA VEZ sobre la base existente, después de DB.sql y seed.sql.
-- No elimina usuarios. Respaldar antes de migrar.
USE seguimiento_posgrado;
ALTER TABLE usuario
 ADD COLUMN clave_institucional VARCHAR(30) NULL,
 ADD COLUMN nombre VARCHAR(150) NULL,
 ADD UNIQUE KEY uq_usuario_clave (clave_institucional);
CREATE TABLE sesion_usuario (
 Id VARCHAR(64) PRIMARY KEY,
 UsuarioId INT NOT NULL,
 UltimaActividad DATETIME(6) NOT NULL,
 Creada DATETIME(6) NOT NULL,
 INDEX ix_sesion_usuario (UsuarioId),
 FOREIGN KEY (UsuarioId) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;
-- Crear el usuario de la aplicación
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'Admin12345!';

-- Permisos de datos únicamente, restringidos al esquema del proyecto
GRANT SELECT, INSERT, UPDATE, DELETE
  ON seguimiento_posgrado.*
  TO 'admin'@'localhost';
-- No se inventan claves ni nombres de usuarios existentes: completarlos desde el panel.
