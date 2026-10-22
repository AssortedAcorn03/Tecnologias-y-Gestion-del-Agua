-- =============================================================
-- Columnas para la gestión de tesis (RF-01.10)
-- =============================================================

USE seguimiento_posgrado;

ALTER TABLE tesis
  ADD COLUMN resumen TEXT NULL
  COMMENT 'Resumen capturado por el tesista al registrar la tesis (RF-01.10.1)',
  ADD COLUMN ultima_actualizacion DATETIME NULL
  COMMENT 'Último cambio en título, resumen, estado o porcentaje (RF-01.10.3)';

ALTER TABLE revision
  ADD COLUMN criterios TEXT NULL
  COMMENT 'Criterios de evaluación aplicados en la revisión (RF-01.10.4)';

-- -------------------------------------------------------------
-- Verificación
-- -------------------------------------------------------------
SELECT table_name, column_name, column_type
FROM information_schema.columns
WHERE table_schema = 'seguimiento_posgrado'
  AND ((table_name = 'tesis'    AND column_name IN ('resumen', 'ultima_actualizacion'))
    OR (table_name = 'revision' AND column_name = 'criterios'))
ORDER BY table_name, column_name;
