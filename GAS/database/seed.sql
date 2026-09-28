-- =============================================================
-- Datos base de catálogos
-- Fuente: documento "Análisis, modelado y diseño del sistema" (AMyD)
--         sección Modelo de datos > Diccionario de datos > Catálogos
-- Ejecutar DESPUÉS de DB.sql
-- Idempotente: se puede volver a correr sin duplicar filas.
-- =============================================================

USE seguimiento_posgrado;
SET NAMES utf8mb4;

-- -------------------------------------------------------------
-- CAT programa académico
-- El AMyD solo identifica la maestría. El doctorado se menciona
-- como posibilidad futura (RNF-02 Escalabilidad), no como dato actual.
-- -------------------------------------------------------------
INSERT INTO CAT_programa_academico (id_programa, nombre, descripcion, activo) VALUES
  (1, 'Maestría en Tecnología y Gestión del Agua', 'Programa de maestría de la Facultad de Ingeniería de la UASLP', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), activo = VALUES(activo);

-- -------------------------------------------------------------
-- CAT rol usuario
-- -------------------------------------------------------------
INSERT INTO CAT_rol_usuario (id_rol_usuario, nombre, descripcion, activo) VALUES
  (1, 'Coordinador',   'Acceso completo: gestiona la información, genera reportes y supervisa el sistema', TRUE),
  (2, 'Administrador', 'Administra usuarios, roles, permisos y catálogos del sistema', TRUE),
  (3, 'Profesor',      'Registra evaluaciones y consulta a los tesistas de los comités en que participa', TRUE),
  (4, 'Alumno',        'Consulta su información académica, evaluaciones y comentarios de su comité', TRUE),
  (5, 'Egresado',      'Registra y actualiza su información profesional y responde encuestas', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), activo = VALUES(activo);

-- Pendiente de confirmar: RF-06 (Asignación de rol y Gestión de usuarios
-- temporales externos) requiere este rol, pero el catálogo del AMyD no lo lista.
-- INSERT INTO CAT_rol_usuario (id_rol_usuario, nombre, descripcion, activo) VALUES
--   (6, 'Usuario externo temporal', 'Integrante externo de comité tutorial con acceso restringido', TRUE)
-- ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), activo = VALUES(activo);

-- -------------------------------------------------------------
-- CAT modalidad titulación
-- -------------------------------------------------------------
INSERT INTO CAT_modalidad_titulacion (id_modalidad, nombre, descripcion, activo) VALUES
  (1, 'Tesis',               'Titulación mediante trabajo de tesis', TRUE),
  (2, 'Artículo científico', 'Titulación mediante publicación de artículo científico', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), activo = VALUES(activo);

-- -------------------------------------------------------------
-- CAT estado académico
-- -------------------------------------------------------------
INSERT INTO CAT_estado_academico (id_estado_academico, nombre, descripcion) VALUES
  (1, 'Activo',   'Alumno inscrito y cursando el programa'),
  (2, 'Titulado', 'Alumno que concluyó su proceso de titulación'),
  (3, 'Baja',     'Alumno separado del programa')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- -------------------------------------------------------------
-- CAT estado tesis
-- -------------------------------------------------------------
INSERT INTO CAT_estado_tesis (id_estado_tesis, nombre, descripcion) VALUES
  (1, 'Sin iniciar',   'Tesis registrada sin avance'),
  (2, 'En progreso',   'Tesis en desarrollo'),
  (3, 'En evaluación', 'Tesis en revisión por el comité tutorial'),
  (4, 'Aceptada',      'Tesis con resolución final favorable')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- -------------------------------------------------------------
-- CAT estado TOEFL
-- -------------------------------------------------------------
INSERT INTO CAT_estado_toefl (id_estado_toefl, nombre, descripcion) VALUES
  (1, 'Pendiente',  'El alumno no ha presentado el examen'),
  (2, 'Presentado', 'Examen presentado, pendiente de validar el resultado'),
  (3, 'Aprobado',   'Requisito TOEFL cumplido')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- -------------------------------------------------------------
-- CAT rol comité
-- -------------------------------------------------------------
INSERT INTO CAT_rol_comite (id_rol_comite, nombre, descripcion) VALUES
  (1, 'Director',   'Responsable principal de la dirección de la tesis'),
  (2, 'Codirector', 'Comparte la dirección de la tesis'),
  (3, 'Asesor',     'Apoya el desarrollo de la tesis como integrante del comité')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- -------------------------------------------------------------
-- CAT tipo documento
-- -------------------------------------------------------------
INSERT INTO CAT_tipo_documento (id_tipo_documento, nombre, descripcion) VALUES
  (1, 'Avance de tesis',    'Documento de avance entregado para evaluación'),
  (2, 'Evidencia',          'Evidencia o anexo asociado a una evaluación'),
  (3, 'Acta de evaluación', 'Acta emitida por el comité tutorial'),
  (4, 'Formato oficial',    'Formato institucional disponible para descarga'),
  (5, 'Tesis final',        'Versión final de la tesis'),
  (6, 'Reporte',            'Reporte generado o cargado al sistema')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- -------------------------------------------------------------
-- CAT estado egresado
-- -------------------------------------------------------------
INSERT INTO CAT_estado_egresado (id_estado_egresado, nombre, descripcion) VALUES
  (1, 'Localizable',    'Egresado con datos de contacto vigentes'),
  (2, 'No localizable', 'Sin respuesta tras el número de intentos de contacto definido por la institución')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- -------------------------------------------------------------
-- CAT situación laboral
-- -------------------------------------------------------------
INSERT INTO CAT_situacion_laboral (id_situacion_laboral, nombre, descripcion) VALUES
  (1, 'Con trabajo', 'El egresado cuenta con empleo'),
  (2, 'Sin trabajo', 'El egresado no cuenta con empleo'),
  (3, 'Becario',     'El egresado cuenta con una beca'),
  (4, 'Otro',        'Situación laboral distinta a las anteriores')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- -------------------------------------------------------------
-- CAT tipo pregunta
-- -------------------------------------------------------------
INSERT INTO CAT_tipo_pregunta (id_tipo_pregunta, nombre, descripcion) VALUES
  (1, 'Abierta',           'Respuesta en texto libre'),
  (2, 'Opción múltiple',   'Selección entre varias opciones'),
  (3, 'Verdadero o falso', 'Respuesta dicotómica'),
  (4, 'Escala numérica',   'Valor dentro de una escala numérica')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- -------------------------------------------------------------
-- CAT tipo reporte
-- -------------------------------------------------------------
INSERT INTO CAT_tipo_reporte (id_tipo_reporte, nombre, descripcion) VALUES
  (1, 'Reporte de egresados',         'Egresados por generación, estado, situación laboral y localizabilidad'),
  (2, 'Reporte de avance de tesis',   'Progreso de tesis por tesista, generación o general'),
  (3, 'Reporte de situación laboral', 'Situación laboral y área profesional de los egresados'),
  (4, 'Reporte por generación',       'Indicadores consolidados por generación'),
  (5, 'Reporte de encuestas',         'Concentrado de respuestas de encuestas a egresados')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- -------------------------------------------------------------
-- CAT formato reporte
-- -------------------------------------------------------------
INSERT INTO CAT_formato_reporte (id_formato_reporte, nombre) VALUES
  (1, 'PDF'),
  (2, 'Excel'),
  (3, 'CSV')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- =============================================================
-- LIMPIEZA (opcional): solo si ya corriste la versión anterior.
-- Borra las filas sobrantes. Fallará si alguna ya está referenciada
-- por una FK; en ese caso reasigna esos registros primero.
-- =============================================================
-- DELETE FROM CAT_programa_academico   WHERE id_programa         > 1;
-- DELETE FROM CAT_modalidad_titulacion WHERE id_modalidad        > 2;
-- DELETE FROM CAT_estado_academico     WHERE id_estado_academico > 3;
-- DELETE FROM CAT_estado_tesis         WHERE id_estado_tesis     > 4;
-- DELETE FROM CAT_estado_toefl         WHERE id_estado_toefl     > 3;
-- DELETE FROM CAT_rol_comite           WHERE id_rol_comite       > 3;
-- DELETE FROM CAT_tipo_documento       WHERE id_tipo_documento   > 6;
-- DELETE FROM CAT_estado_egresado      WHERE id_estado_egresado  > 2;
-- DELETE FROM CAT_situacion_laboral    WHERE id_situacion_laboral > 4;
-- DELETE FROM CAT_tipo_pregunta        WHERE id_tipo_pregunta    > 4;
-- DELETE FROM CAT_tipo_reporte         WHERE id_tipo_reporte     > 5;

-- El usuario de la aplicación y sus permisos se crean aparte, en
-- ../Extras/crear-usuario.sql (fuera del repositorio, contiene credenciales).
