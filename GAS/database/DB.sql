-- =============================================================
-- Sistema de seguimiento académico y egresados
-- MySQL 8.0+  /  InnoDB  /  utf8mb4
-- =============================================================

CREATE DATABASE IF NOT EXISTS seguimiento_posgrado
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE seguimiento_posgrado;

-- =============================================================
-- CATÁLOGOS
-- =============================================================

CREATE TABLE CAT_programa_academico (
  id_programa   INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  descripcion   VARCHAR(255),
  activo        BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE CAT_rol_usuario (
  id_rol_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  descripcion    VARCHAR(255),
  activo         BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE CAT_modalidad_titulacion (
  id_modalidad INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  descripcion  VARCHAR(255),
  activo       BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE CAT_estado_academico (
  id_estado_academico INT AUTO_INCREMENT PRIMARY KEY,
  nombre              VARCHAR(100) NOT NULL,
  descripcion         VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CAT_estado_tesis (
  id_estado_tesis INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  descripcion     VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CAT_estado_toefl (
  id_estado_toefl INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  descripcion     VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CAT_rol_comite (
  id_rol_comite INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CAT_tipo_documento (
  id_tipo_documento INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(100) NOT NULL,
  descripcion       VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CAT_estado_egresado (
  id_estado_egresado INT AUTO_INCREMENT PRIMARY KEY,
  nombre             VARCHAR(100) NOT NULL,
  descripcion        VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CAT_situacion_laboral (
  id_situacion_laboral INT AUTO_INCREMENT PRIMARY KEY,
  nombre               VARCHAR(100) NOT NULL,
  descripcion          VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CAT_tipo_pregunta (
  id_tipo_pregunta INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  descripcion      VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CAT_tipo_reporte (
  id_tipo_reporte INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100) NOT NULL,
  descripcion     VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE CAT_formato_reporte (
  id_formato_reporte INT AUTO_INCREMENT PRIMARY KEY,
  nombre             VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- =============================================================
-- USUARIOS Y ACCESO (login local propio)
-- =============================================================

CREATE TABLE usuario (
  id_usuario       INT AUTO_INCREMENT PRIMARY KEY,
  correo           VARCHAR(100) NOT NULL UNIQUE,
  contrasena_hash  VARCHAR(255) NOT NULL,
  id_rol_usuario   INT,
  activo           BOOLEAN DEFAULT TRUE,
  intentos_fallidos INT DEFAULT 0,
  bloqueado_hasta  DATETIME,
  requiere_cambio  BOOLEAN DEFAULT FALSE,
  fecha_creacion   DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso    DATETIME,
  CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol_usuario) REFERENCES CAT_rol_usuario(id_rol_usuario)
) ENGINE=InnoDB;

CREATE TABLE token_recuperacion (
  id_token         INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario       INT NOT NULL,
  token            VARCHAR(255) NOT NULL UNIQUE,
  fecha_expiracion DATETIME NOT NULL,
  usado            BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_token_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE log_acceso (
  id_log     INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT,
  fecha      DATETIME DEFAULT CURRENT_TIMESTAMP,
  resultado  VARCHAR(20),
  ip         VARCHAR(45),
  CONSTRAINT fk_log_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

-- =============================================================
-- PROGRAMA / GENERACIÓN / PERIODO
-- =============================================================

CREATE TABLE generacion (
  id_generacion       INT AUTO_INCREMENT PRIMARY KEY,
  id_programa         INT NOT NULL,
  anio_ingreso        INT,
  anio_egreso_estimado INT,
  nombre_generacion   VARCHAR(100),
  CONSTRAINT fk_generacion_programa
    FOREIGN KEY (id_programa) REFERENCES CAT_programa_academico(id_programa)
) ENGINE=InnoDB;

CREATE TABLE periodo_academico (
  id_periodo   INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100),
  fecha_inicio DATE,
  fecha_fin    DATE,
  tipo_periodo VARCHAR(50)
) ENGINE=InnoDB;

-- =============================================================
-- ALUMNO Y SU INSCRIPCIÓN SEMESTRAL
-- =============================================================

CREATE TABLE alumno (
  clave_alumno        INT PRIMARY KEY,
  nombre              VARCHAR(50),
  apellido_paterno    VARCHAR(50),
  apellido_materno    VARCHAR(50),
  fecha_ingreso       DATE,
  activo              BOOLEAN DEFAULT TRUE,
  id_usuario          INT,
  id_programa         INT,
  id_generacion       INT,
  correo_institucional VARCHAR(100),
  correo_personal     VARCHAR(100),
  telefono            VARCHAR(20),
  id_modalidad        INT,
  id_estado_academico INT,
  CONSTRAINT fk_alumno_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_alumno_programa
    FOREIGN KEY (id_programa) REFERENCES CAT_programa_academico(id_programa),
  CONSTRAINT fk_alumno_generacion
    FOREIGN KEY (id_generacion) REFERENCES generacion(id_generacion),
  CONSTRAINT fk_alumno_modalidad
    FOREIGN KEY (id_modalidad) REFERENCES CAT_modalidad_titulacion(id_modalidad),
  CONSTRAINT fk_alumno_estado_academico
    FOREIGN KEY (id_estado_academico) REFERENCES CAT_estado_academico(id_estado_academico)
) ENGINE=InnoDB;

CREATE TABLE alumno_detalle (
  id_alumno_detalle INT AUTO_INCREMENT PRIMARY KEY,
  clave_alumno      INT NOT NULL,
  id_periodo        INT NOT NULL,
  semestre          INT,
  fecha_registro    DATE,
  CONSTRAINT fk_detalle_alumno
    FOREIGN KEY (clave_alumno) REFERENCES alumno(clave_alumno),
  CONSTRAINT fk_detalle_periodo
    FOREIGN KEY (id_periodo) REFERENCES periodo_academico(id_periodo),
  CONSTRAINT uq_alumno_periodo UNIQUE (clave_alumno, id_periodo)
) ENGINE=InnoDB;

-- =============================================================
-- PROFESOR
-- =============================================================

CREATE TABLE profesor (
  rpe              INT PRIMARY KEY,
  nombre           VARCHAR(50),
  apellido_paterno VARCHAR(50),
  apellido_materno VARCHAR(50)
) ENGINE=InnoDB;

CREATE TABLE profesor_detalle (
  id_profesor_detalle  INT AUTO_INCREMENT PRIMARY KEY,
  rpe                  INT NOT NULL,
  id_usuario           INT,
  correo_institucional VARCHAR(100),
  activo               BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_profdet_profesor
    FOREIGN KEY (rpe) REFERENCES profesor(rpe),
  CONSTRAINT fk_profdet_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

-- =============================================================
-- TESIS
-- =============================================================

CREATE TABLE tesis (
  id_tesis         INT AUTO_INCREMENT PRIMARY KEY,
  titulo           VARCHAR(255),
  clave_alumno     INT NOT NULL,
  id_programa      INT,
  porcentaje_actual DECIMAL(5,2),
  id_estado_tesis  INT,
  fecha_registro   DATE,
  CONSTRAINT fk_tesis_alumno
    FOREIGN KEY (clave_alumno) REFERENCES alumno(clave_alumno),
  CONSTRAINT fk_tesis_programa
    FOREIGN KEY (id_programa) REFERENCES CAT_programa_academico(id_programa),
  CONSTRAINT fk_tesis_estado
    FOREIGN KEY (id_estado_tesis) REFERENCES CAT_estado_tesis(id_estado_tesis)
) ENGINE=InnoDB;

-- =============================================================
-- COMITÉ TUTORIAL
-- =============================================================

CREATE TABLE comite (
  id_comite INT AUTO_INCREMENT PRIMARY KEY,
  id_tesis  INT NOT NULL,
  tipo      VARCHAR(50),
  CONSTRAINT fk_comite_tesis
    FOREIGN KEY (id_tesis) REFERENCES tesis(id_tesis)
) ENGINE=InnoDB;

CREATE TABLE comite_profesor (
  id_comite_profesor INT AUTO_INCREMENT PRIMARY KEY,
  id_comite          INT NOT NULL,
  rpe                INT NOT NULL,
  id_rol_comite      INT NOT NULL,
  fecha_asignacion   DATE,
  activo             BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_cp_comite
    FOREIGN KEY (id_comite) REFERENCES comite(id_comite),
  CONSTRAINT fk_cp_profesor
    FOREIGN KEY (rpe) REFERENCES profesor(rpe),
  CONSTRAINT fk_cp_rol
    FOREIGN KEY (id_rol_comite) REFERENCES CAT_rol_comite(id_rol_comite)
) ENGINE=InnoDB;

-- =============================================================
-- REQUISITO TOEFL
-- =============================================================

CREATE TABLE requisito_toefl (
  id_toefl          INT AUTO_INCREMENT PRIMARY KEY,
  clave_alumno      INT NOT NULL,
  id_estado_toefl   INT,
  fecha_presentacion DATE,
  puntaje           DECIMAL(5,2),
  observaciones     TEXT,
  CONSTRAINT fk_toefl_alumno
    FOREIGN KEY (clave_alumno) REFERENCES alumno(clave_alumno),
  CONSTRAINT fk_toefl_estado
    FOREIGN KEY (id_estado_toefl) REFERENCES CAT_estado_toefl(id_estado_toefl)
) ENGINE=InnoDB;

-- =============================================================
-- REVISIONES / EVALUACIONES DE TESIS
-- =============================================================

CREATE TABLE revision (
  id_revision       INT AUTO_INCREMENT PRIMARY KEY,
  fecha             DATE,
  id_tesis          INT NOT NULL,
  id_periodo        INT,
  comentarios       TEXT,
  porcentaje_avance DECIMAL(5,2),
  estado            VARCHAR(50),
  CONSTRAINT fk_revision_tesis
    FOREIGN KEY (id_tesis) REFERENCES tesis(id_tesis),
  CONSTRAINT fk_revision_periodo
    FOREIGN KEY (id_periodo) REFERENCES periodo_academico(id_periodo)
) ENGINE=InnoDB;

CREATE TABLE revision_profesor (
  id_revision_profesor INT AUTO_INCREMENT PRIMARY KEY,
  rpe                  INT NOT NULL,
  id_revision          INT NOT NULL,
  comentarios          TEXT,
  CONSTRAINT fk_rp_profesor
    FOREIGN KEY (rpe) REFERENCES profesor(rpe),
  CONSTRAINT fk_rp_revision
    FOREIGN KEY (id_revision) REFERENCES revision(id_revision)
) ENGINE=InnoDB;

CREATE TABLE acuerdo_evaluacion (
  id_acuerdo       INT AUTO_INCREMENT PRIMARY KEY,
  id_revision      INT NOT NULL,
  descripcion      TEXT,
  fecha_compromiso DATE,
  cumplido         BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_acuerdo_revision
    FOREIGN KEY (id_revision) REFERENCES revision(id_revision)
) ENGINE=InnoDB;

CREATE TABLE acta_comite (
  cve_acta       CHAR(6) PRIMARY KEY,
  clave_alumno   INT NOT NULL,
  id_comite      INT NOT NULL,
  id_revision    INT,
  id_toefl       INT,
  num_evaluacion INT,
  fecha_reunion  DATE,
  observaciones  TEXT,
  resultado      VARCHAR(50),
  archivo_acta   VARCHAR(255),
  estado         BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_acta_alumno
    FOREIGN KEY (clave_alumno) REFERENCES alumno(clave_alumno),
  CONSTRAINT fk_acta_comite
    FOREIGN KEY (id_comite) REFERENCES comite(id_comite),
  CONSTRAINT fk_acta_revision
    FOREIGN KEY (id_revision) REFERENCES revision(id_revision),
  CONSTRAINT fk_acta_toefl
    FOREIGN KEY (id_toefl) REFERENCES requisito_toefl(id_toefl)
) ENGINE=InnoDB;

-- =============================================================
-- DOCUMENTOS
-- =============================================================

CREATE TABLE documento (
  id_documento      INT AUTO_INCREMENT PRIMARY KEY,
  clave_alumno      INT,
  id_tesis          INT,
  id_revision       INT,
  cve_acta          CHAR(6),
  id_tipo_documento INT,
  nombre_archivo    VARCHAR(255),
  ruta_archivo      VARCHAR(255),
  fecha_carga       DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doc_alumno
    FOREIGN KEY (clave_alumno) REFERENCES alumno(clave_alumno),
  CONSTRAINT fk_doc_tesis
    FOREIGN KEY (id_tesis) REFERENCES tesis(id_tesis),
  CONSTRAINT fk_doc_revision
    FOREIGN KEY (id_revision) REFERENCES revision(id_revision),
  CONSTRAINT fk_doc_acta
    FOREIGN KEY (cve_acta) REFERENCES acta_comite(cve_acta),
  CONSTRAINT fk_doc_tipo
    FOREIGN KEY (id_tipo_documento) REFERENCES CAT_tipo_documento(id_tipo_documento)
) ENGINE=InnoDB;

-- =============================================================
-- EGRESADO Y EMPLEO
-- =============================================================

CREATE TABLE egresado (
  clave_alumno          INT PRIMARY KEY,
  id_egresado           INT UNIQUE,
  fecha_egreso          DATE,
  id_estado_egresado    INT,
  identificador_egresado VARCHAR(50),
  correo                VARCHAR(100),
  telefono              VARCHAR(20),
  ciudad                VARCHAR(100),
  ultima_actualizacion  DATE,
  localizable           BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_egresado_alumno
    FOREIGN KEY (clave_alumno) REFERENCES alumno(clave_alumno),
  CONSTRAINT fk_egresado_estado
    FOREIGN KEY (id_estado_egresado) REFERENCES CAT_estado_egresado(id_estado_egresado)
) ENGINE=InnoDB;

CREATE TABLE empresa (
  id_empresa INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(150),
  sector     VARCHAR(100),
  pais       VARCHAR(100),
  estado     VARCHAR(100),
  ciudad     VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE empleo (
  id_empleo            INT AUTO_INCREMENT PRIMARY KEY,
  clave_alumno         INT NOT NULL,
  id_empresa           INT,
  tipo                 VARCHAR(100),
  id_situacion_laboral INT,
  area_profesional     VARCHAR(100),
  trabajo_actual       BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_empleo_egresado
    FOREIGN KEY (clave_alumno) REFERENCES egresado(clave_alumno),
  CONSTRAINT fk_empleo_empresa
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
  CONSTRAINT fk_empleo_situacion
    FOREIGN KEY (id_situacion_laboral) REFERENCES CAT_situacion_laboral(id_situacion_laboral)
) ENGINE=InnoDB;

CREATE TABLE detalle_empleo (
  id_detalle_empleo INT AUTO_INCREMENT PRIMARY KEY,
  id_empleo         INT NOT NULL,
  puesto            VARCHAR(100),
  fecha_inicio      DATE,
  fecha_final       DATE,
  sueldo            DECIMAL(10,2),
  relacion_posgrado BOOLEAN,
  CONSTRAINT fk_detempleo_empleo
    FOREIGN KEY (id_empleo) REFERENCES empleo(id_empleo)
) ENGINE=InnoDB;

CREATE TABLE intento_contacto (
  id_intento    INT AUTO_INCREMENT PRIMARY KEY,
  clave_alumno  INT NOT NULL,
  fecha_intento DATE,
  observaciones TEXT,
  CONSTRAINT fk_intento_egresado
    FOREIGN KEY (clave_alumno) REFERENCES egresado(clave_alumno)
) ENGINE=InnoDB;

CREATE TABLE retroalimentacion_egresado (
  id_retroalimentacion INT AUTO_INCREMENT PRIMARY KEY,
  clave_alumno         INT NOT NULL,
  fecha                DATE,
  comentario           TEXT,
  sugerencia           TEXT,
  CONSTRAINT fk_retro_egresado
    FOREIGN KEY (clave_alumno) REFERENCES egresado(clave_alumno)
) ENGINE=InnoDB;

-- =============================================================
-- ENCUESTAS Y RESPUESTAS
-- =============================================================

CREATE TABLE encuesta (
  id_encuesta    INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(150),
  tipo           VARCHAR(100),
  fecha_creacion DATE,
  activa         BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE seccion_encuesta (
  id_seccion  INT AUTO_INCREMENT PRIMARY KEY,
  id_encuesta INT NOT NULL,
  nombre      VARCHAR(150),
  orden       INT,
  CONSTRAINT fk_seccion_encuesta
    FOREIGN KEY (id_encuesta) REFERENCES encuesta(id_encuesta)
) ENGINE=InnoDB;

CREATE TABLE pregunta (
  id_pregunta      INT AUTO_INCREMENT PRIMARY KEY,
  id_seccion       INT NOT NULL,
  id_tipo_pregunta INT,
  texto            TEXT,
  obligatoria      BOOLEAN DEFAULT FALSE,
  orden            INT,
  CONSTRAINT fk_pregunta_seccion
    FOREIGN KEY (id_seccion) REFERENCES seccion_encuesta(id_seccion),
  CONSTRAINT fk_pregunta_tipo
    FOREIGN KEY (id_tipo_pregunta) REFERENCES CAT_tipo_pregunta(id_tipo_pregunta)
) ENGINE=InnoDB;

CREATE TABLE opcion_pregunta (
  id_opcion   INT AUTO_INCREMENT PRIMARY KEY,
  id_pregunta INT NOT NULL,
  texto       VARCHAR(255),
  valor       INT,
  orden       INT,
  CONSTRAINT fk_opcion_pregunta
    FOREIGN KEY (id_pregunta) REFERENCES pregunta(id_pregunta)
) ENGINE=InnoDB;

CREATE TABLE respuesta_encuesta (
  id_respuesta_encuesta INT AUTO_INCREMENT PRIMARY KEY,
  id_encuesta           INT NOT NULL,
  clave_alumno          INT NOT NULL,
  fecha_inicio          DATETIME,
  fecha_envio           DATETIME,
  completada            BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_respenc_encuesta
    FOREIGN KEY (id_encuesta) REFERENCES encuesta(id_encuesta),
  CONSTRAINT fk_respenc_egresado
    FOREIGN KEY (clave_alumno) REFERENCES egresado(clave_alumno)
) ENGINE=InnoDB;

CREATE TABLE respuesta (
  id_respuesta          INT AUTO_INCREMENT PRIMARY KEY,
  id_respuesta_encuesta INT NOT NULL,
  id_pregunta           INT NOT NULL,
  id_opcion             INT,
  respuesta             TEXT,
  fecha_respuesta       DATETIME,
  CONSTRAINT fk_resp_envio
    FOREIGN KEY (id_respuesta_encuesta) REFERENCES respuesta_encuesta(id_respuesta_encuesta),
  CONSTRAINT fk_resp_pregunta
    FOREIGN KEY (id_pregunta) REFERENCES pregunta(id_pregunta),
  CONSTRAINT fk_resp_opcion
    FOREIGN KEY (id_opcion) REFERENCES opcion_pregunta(id_opcion)
) ENGINE=InnoDB;

-- =============================================================
-- REPORTES
-- =============================================================

CREATE TABLE reporte (
  id_reporte         INT AUTO_INCREMENT PRIMARY KEY,
  id_tipo_reporte    INT,
  id_formato_reporte INT,
  id_usuario_genero  INT,
  fecha_generacion   DATETIME DEFAULT CURRENT_TIMESTAMP,
  filtros_usados     TEXT,
  ruta_archivo       VARCHAR(255),
  CONSTRAINT fk_reporte_tipo
    FOREIGN KEY (id_tipo_reporte) REFERENCES CAT_tipo_reporte(id_tipo_reporte),
  CONSTRAINT fk_reporte_formato
    FOREIGN KEY (id_formato_reporte) REFERENCES CAT_formato_reporte(id_formato_reporte),
  CONSTRAINT fk_reporte_usuario
    FOREIGN KEY (id_usuario_genero) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;