-- =============================================================
-- Circuito de solicitud y aprobación de tesis (RF-01.10.1)
-- =============================================================

USE seguimiento_posgrado;

ALTER TABLE tesis
  -- Capturados por el tesista al presentar la solicitud.
  ADD COLUMN linea_investigacion VARCHAR(255) NULL
    COMMENT 'Línea de investigación declarada por el tesista',
  -- La modalidad de la tesis es propia de la tesis y NO se deriva de
  -- `alumno.id_modalidad`: aquella es la intención registrada al ingresar y
  -- el coordinador puede cambiarla, mientras que ésta queda fijada por la
  -- solicitud que el director aprobó.
  ADD COLUMN id_modalidad INT NULL
    COMMENT 'Modalidad de titulación con la que se aprobó la tesis',

  -- Circuito de aprobación.
  ADD COLUMN estado_solicitud VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
    COMMENT 'Pendiente | Aceptada | Rechazada',
  ADD COLUMN rpe_director INT NULL
    COMMENT 'Director propuesto por el tesista, y confirmado si acepta',
  ADD COLUMN fecha_solicitud DATE NULL
    COMMENT 'Cuándo el tesista presentó la solicitud',
  ADD COLUMN fecha_resolucion DATE NULL
    COMMENT 'Cuándo el director aceptó o rechazó',
  ADD COLUMN motivo_rechazo VARCHAR(255) NULL
    COMMENT 'Razón del rechazo, para que el tesista proponga otro director',

  ADD CONSTRAINT fk_tesis_modalidad
    FOREIGN KEY (id_modalidad) REFERENCES CAT_modalidad_titulacion(id_modalidad),
  ADD CONSTRAINT fk_tesis_director
    FOREIGN KEY (rpe_director) REFERENCES profesor(rpe),

  -- El director consulta sus solicitudes pendientes por aquí.
  ADD KEY ix_tesis_solicitud (estado_solicitud, rpe_director);

-- -------------------------------------------------------------
-- Las tesis que ya existían se dan por aceptadas: se registraron
-- directamente, antes de que hubiera circuito de aprobación.
-- -------------------------------------------------------------
UPDATE tesis
SET estado_solicitud = 'Aceptada',
    fecha_solicitud  = COALESCE(fecha_solicitud, fecha_registro),
    fecha_resolucion = COALESCE(fecha_resolucion, fecha_registro)
WHERE estado_solicitud = 'Pendiente';

-- -------------------------------------------------------------
-- Verificación
-- -------------------------------------------------------------
SELECT column_name, column_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'seguimiento_posgrado' AND table_name = 'tesis'
  AND column_name IN ('linea_investigacion','id_modalidad','estado_solicitud',
                      'rpe_director','fecha_solicitud','fecha_resolucion','motivo_rechazo')
ORDER BY ordinal_position;

SELECT id_tesis, estado_solicitud, fecha_solicitud, fecha_resolucion FROM tesis;
