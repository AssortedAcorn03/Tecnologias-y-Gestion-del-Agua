-- =============================================================
-- Columnas para la actualización de datos del egresado
-- (RF-02.3 Actualización de datos personales,
--  RF-02.4 Actualización de historial laboral)
-- =============================================================

USE seguimiento_posgrado;

-- Teléfono alterno, LinkedIn, red social... texto libre: el AMyD no
-- acota el formato y encerrarlo en columnas separadas sería adivinar.
ALTER TABLE egresado
  ADD COLUMN otros_contactos VARCHAR(255) NULL
  COMMENT 'Medios de contacto adicionales (RF-02.3)';

-- Descripción de funciones del puesto. TEXT y no VARCHAR porque es
-- redacción libre del egresado, no un dato estructurado.
ALTER TABLE detalle_empleo
  ADD COLUMN actividades TEXT NULL
  COMMENT 'Actividades realizadas en el puesto (RF-02.4)';

-- -------------------------------------------------------------
-- Verificación
-- -------------------------------------------------------------
SELECT table_name, column_name, column_type
FROM information_schema.columns
WHERE table_schema = 'seguimiento_posgrado'
  AND ((table_name = 'egresado'       AND column_name = 'otros_contactos')
    OR (table_name = 'detalle_empleo' AND column_name = 'actividades'));
