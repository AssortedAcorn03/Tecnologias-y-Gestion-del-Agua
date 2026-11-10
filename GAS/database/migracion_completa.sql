-- Migración acumulada del esquema de GAS.
-- Ejecutar sobre una base ya creada con DB.sql y seed.sql.
-- Es idempotente: puede ejecutarse nuevamente sin repetir columnas, índices
-- ni claves foráneas. No crea usuarios ni contraseñas de MySQL.

USE seguimiento_posgrado;

DELIMITER //

DROP PROCEDURE IF EXISTS gas_add_column //
CREATE PROCEDURE gas_add_column(
    IN p_table VARCHAR(64),
    IN p_column VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table
          AND COLUMN_NAME = p_column
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `',
                          p_column, '` ', p_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DROP PROCEDURE IF EXISTS gas_add_index //
CREATE PROCEDURE gas_add_index(
    IN p_table VARCHAR(64),
    IN p_index VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table
          AND INDEX_NAME = p_index
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD ', p_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DROP PROCEDURE IF EXISTS gas_add_fk //
CREATE PROCEDURE gas_add_fk(
    IN p_table VARCHAR(64),
    IN p_constraint VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = p_table
          AND CONSTRAINT_NAME = p_constraint
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', p_table, '` ADD CONSTRAINT `',
                          p_constraint, '` ', p_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

CALL gas_add_column('usuario', 'clave_institucional',
    'VARCHAR(30) NULL');
CALL gas_add_column('usuario', 'nombre',
    'VARCHAR(150) NULL');
CALL gas_add_index('usuario', 'uq_usuario_clave',
    'UNIQUE KEY `uq_usuario_clave` (`clave_institucional`)');

CREATE TABLE IF NOT EXISTS sesion_usuario (
    Id VARCHAR(64) PRIMARY KEY,
    UsuarioId INT NOT NULL,
    UltimaActividad DATETIME(6) NOT NULL,
    Creada DATETIME(6) NOT NULL,
    INDEX ix_sesion_usuario (UsuarioId),
    CONSTRAINT fk_sesion_usuario
        FOREIGN KEY (UsuarioId) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

CALL gas_add_column('egresado', 'otros_contactos',
    'VARCHAR(255) NULL COMMENT ''Medios de contacto adicionales (RF-02.3)''');
CALL gas_add_column('detalle_empleo', 'actividades',
    'TEXT NULL COMMENT ''Actividades realizadas en el puesto (RF-02.4)''');

CALL gas_add_column('tesis', 'resumen',
    'TEXT NULL COMMENT ''Resumen capturado por el tesista (RF-01.10.1)''');
CALL gas_add_column('tesis', 'ultima_actualizacion',
    'DATETIME NULL COMMENT ''Último cambio de la tesis (RF-01.10.3)''');
CALL gas_add_column('tesis', 'linea_investigacion',
    'VARCHAR(255) NULL COMMENT ''Línea de investigación declarada por el tesista''');
CALL gas_add_column('tesis', 'id_modalidad',
    'INT NULL COMMENT ''Modalidad de titulación de la tesis''');
CALL gas_add_column('tesis', 'estado_solicitud',
    'VARCHAR(20) NOT NULL DEFAULT ''Pendiente'' COMMENT ''Pendiente | Aceptada | Rechazada''');
CALL gas_add_column('tesis', 'rpe_director',
    'INT NULL COMMENT ''Director propuesto o confirmado''');
CALL gas_add_column('tesis', 'fecha_solicitud',
    'DATE NULL COMMENT ''Fecha de presentación de la solicitud''');
CALL gas_add_column('tesis', 'fecha_resolucion',
    'DATE NULL COMMENT ''Fecha de resolución del director''');
CALL gas_add_column('tesis', 'motivo_rechazo',
    'VARCHAR(255) NULL COMMENT ''Motivo del rechazo''');
CALL gas_add_column('revision', 'criterios',
    'TEXT NULL COMMENT ''Criterios de evaluación aplicados''');

CALL gas_add_fk('tesis', 'fk_tesis_modalidad',
    'FOREIGN KEY (`id_modalidad`) REFERENCES `CAT_modalidad_titulacion` (`id_modalidad`)');
CALL gas_add_fk('tesis', 'fk_tesis_director',
    'FOREIGN KEY (`rpe_director`) REFERENCES `profesor` (`rpe`)');
CALL gas_add_index('tesis', 'ix_tesis_solicitud',
    'KEY `ix_tesis_solicitud` (`estado_solicitud`, `rpe_director`)');

UPDATE tesis
SET estado_solicitud = 'Aceptada',
    fecha_solicitud = COALESCE(fecha_solicitud, fecha_registro),
    fecha_resolucion = COALESCE(fecha_resolucion, fecha_registro)
WHERE estado_solicitud = 'Pendiente'
  AND fecha_registro IS NOT NULL;

CREATE TABLE IF NOT EXISTS historial_comite (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_comite INT NOT NULL,
    id_usuario INT NULL,
    accion VARCHAR(30) NOT NULL,
    rpe_anterior INT NULL,
    rpe_nuevo INT NULL,
    id_rol_anterior INT NULL,
    id_rol_nuevo INT NULL,
    fecha_cambio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(500) NULL,
    CONSTRAINT fk_historial_comite
        FOREIGN KEY (id_comite) REFERENCES comite(id_comite),
    CONSTRAINT fk_historial_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE SET NULL,
    CONSTRAINT fk_historial_rpe_anterior
        FOREIGN KEY (rpe_anterior) REFERENCES profesor(rpe)
        ON DELETE SET NULL,
    CONSTRAINT fk_historial_rpe_nuevo
        FOREIGN KEY (rpe_nuevo) REFERENCES profesor(rpe)
        ON DELETE SET NULL,
    CONSTRAINT fk_historial_rol_anterior
        FOREIGN KEY (id_rol_anterior) REFERENCES CAT_rol_comite(id_rol_comite)
        ON DELETE SET NULL,
    CONSTRAINT fk_historial_rol_nuevo
        FOREIGN KEY (id_rol_nuevo) REFERENCES CAT_rol_comite(id_rol_comite)
        ON DELETE SET NULL
) ENGINE=InnoDB;

DROP PROCEDURE gas_add_column;
DROP PROCEDURE gas_add_index;
DROP PROCEDURE gas_add_fk;

SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND (
      (table_name = 'usuario' AND column_name IN ('clave_institucional', 'nombre'))
   OR (table_name = 'egresado' AND column_name = 'otros_contactos')
   OR (table_name = 'detalle_empleo' AND column_name = 'actividades')
   OR (table_name = 'tesis' AND column_name IN (
       'resumen', 'ultima_actualizacion', 'linea_investigacion',
       'id_modalidad', 'estado_solicitud', 'rpe_director',
       'fecha_solicitud', 'fecha_resolucion', 'motivo_rechazo'))
   OR (table_name = 'revision' AND column_name = 'criterios')
  )
ORDER BY table_name, ordinal_position;

SELECT table_name
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('sesion_usuario', 'historial_comite');
