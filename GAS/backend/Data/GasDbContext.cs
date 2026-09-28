using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public partial class GasDbContext : DbContext
{
    public GasDbContext(DbContextOptions<GasDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<CAT_estado_academico> CAT_estado_academicos { get; set; }

    public virtual DbSet<CAT_estado_egresado> CAT_estado_egresados { get; set; }

    public virtual DbSet<CAT_estado_tesi> CAT_estado_teses { get; set; }

    public virtual DbSet<CAT_estado_toefl> CAT_estado_toefls { get; set; }

    public virtual DbSet<CAT_formato_reporte> CAT_formato_reportes { get; set; }

    public virtual DbSet<CAT_modalidad_titulacion> CAT_modalidad_titulacions { get; set; }

    public virtual DbSet<CAT_programa_academico> CAT_programa_academicos { get; set; }

    public virtual DbSet<CAT_rol_comite> CAT_rol_comites { get; set; }

    public virtual DbSet<CAT_rol_usuario> CAT_rol_usuarios { get; set; }

    public virtual DbSet<CAT_situacion_laboral> CAT_situacion_laborals { get; set; }

    public virtual DbSet<CAT_tipo_documento> CAT_tipo_documentos { get; set; }

    public virtual DbSet<CAT_tipo_preguntum> CAT_tipo_pregunta { get; set; }

    public virtual DbSet<CAT_tipo_reporte> CAT_tipo_reportes { get; set; }

    public virtual DbSet<acta_comite> acta_comites { get; set; }

    public virtual DbSet<acuerdo_evaluacion> acuerdo_evaluacions { get; set; }

    public virtual DbSet<alumno> alumnos { get; set; }

    public virtual DbSet<alumno_detalle> alumno_detalles { get; set; }

    public virtual DbSet<comite> comites { get; set; }

    public virtual DbSet<comite_profesor> comite_profesors { get; set; }

    public virtual DbSet<detalle_empleo> detalle_empleos { get; set; }

    public virtual DbSet<documento> documentos { get; set; }

    public virtual DbSet<egresado> egresados { get; set; }

    public virtual DbSet<empleo> empleos { get; set; }

    public virtual DbSet<empresa> empresas { get; set; }

    public virtual DbSet<encuestum> encuesta { get; set; }

    public virtual DbSet<generacion> generacions { get; set; }

    public virtual DbSet<intento_contacto> intento_contactos { get; set; }

    public virtual DbSet<log_acceso> log_accesos { get; set; }

    public virtual DbSet<opcion_preguntum> opcion_pregunta { get; set; }

    public virtual DbSet<periodo_academico> periodo_academicos { get; set; }

    public virtual DbSet<preguntum> pregunta { get; set; }

    public virtual DbSet<profesor> profesors { get; set; }

    public virtual DbSet<profesor_detalle> profesor_detalles { get; set; }

    public virtual DbSet<reporte> reportes { get; set; }

    public virtual DbSet<requisito_toefl> requisito_toefls { get; set; }

    public virtual DbSet<respuesta_encuestum> respuesta_encuesta { get; set; }

    public virtual DbSet<respuestum> respuesta { get; set; }

    public virtual DbSet<retroalimentacion_egresado> retroalimentacion_egresados { get; set; }

    public virtual DbSet<revision> revisions { get; set; }

    public virtual DbSet<revision_profesor> revision_profesors { get; set; }

    public virtual DbSet<seccion_encuestum> seccion_encuesta { get; set; }

    public virtual DbSet<tesi> teses { get; set; }

    public virtual DbSet<token_recuperacion> token_recuperacions { get; set; }

    public virtual DbSet<usuario> usuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CAT_estado_academico>(entity =>
        {
            entity.HasKey(e => e.id_estado_academico).HasName("PRIMARY");

            entity.ToTable("CAT_estado_academico");

            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_estado_egresado>(entity =>
        {
            entity.HasKey(e => e.id_estado_egresado).HasName("PRIMARY");

            entity.ToTable("CAT_estado_egresado");

            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_estado_tesi>(entity =>
        {
            entity.HasKey(e => e.id_estado_tesis).HasName("PRIMARY");

            entity.ToTable("CAT_estado_tesis");

            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_estado_toefl>(entity =>
        {
            entity.HasKey(e => e.id_estado_toefl).HasName("PRIMARY");

            entity.ToTable("CAT_estado_toefl");

            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_formato_reporte>(entity =>
        {
            entity.HasKey(e => e.id_formato_reporte).HasName("PRIMARY");

            entity.ToTable("CAT_formato_reporte");

            entity.Property(e => e.nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<CAT_modalidad_titulacion>(entity =>
        {
            entity.HasKey(e => e.id_modalidad).HasName("PRIMARY");

            entity.ToTable("CAT_modalidad_titulacion");

            entity.Property(e => e.activo).HasDefaultValueSql("'1'");
            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_programa_academico>(entity =>
        {
            entity.HasKey(e => e.id_programa).HasName("PRIMARY");

            entity.ToTable("CAT_programa_academico");

            entity.Property(e => e.activo).HasDefaultValueSql("'1'");
            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(150);
        });

        modelBuilder.Entity<CAT_rol_comite>(entity =>
        {
            entity.HasKey(e => e.id_rol_comite).HasName("PRIMARY");

            entity.ToTable("CAT_rol_comite");

            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_rol_usuario>(entity =>
        {
            entity.HasKey(e => e.id_rol_usuario).HasName("PRIMARY");

            entity.ToTable("CAT_rol_usuario");

            entity.Property(e => e.activo).HasDefaultValueSql("'1'");
            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_situacion_laboral>(entity =>
        {
            entity.HasKey(e => e.id_situacion_laboral).HasName("PRIMARY");

            entity.ToTable("CAT_situacion_laboral");

            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_tipo_documento>(entity =>
        {
            entity.HasKey(e => e.id_tipo_documento).HasName("PRIMARY");

            entity.ToTable("CAT_tipo_documento");

            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_tipo_preguntum>(entity =>
        {
            entity.HasKey(e => e.id_tipo_pregunta).HasName("PRIMARY");

            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<CAT_tipo_reporte>(entity =>
        {
            entity.HasKey(e => e.id_tipo_reporte).HasName("PRIMARY");

            entity.ToTable("CAT_tipo_reporte");

            entity.Property(e => e.descripcion).HasMaxLength(255);
            entity.Property(e => e.nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<acta_comite>(entity =>
        {
            entity.HasKey(e => e.cve_acta).HasName("PRIMARY");

            entity.ToTable("acta_comite");

            entity.HasIndex(e => e.clave_alumno, "fk_acta_alumno");

            entity.HasIndex(e => e.id_comite, "fk_acta_comite");

            entity.HasIndex(e => e.id_revision, "fk_acta_revision");

            entity.HasIndex(e => e.id_toefl, "fk_acta_toefl");

            entity.Property(e => e.cve_acta)
                .HasMaxLength(6)
                .IsFixedLength();
            entity.Property(e => e.archivo_acta).HasMaxLength(255);
            entity.Property(e => e.estado).HasDefaultValueSql("'1'");
            entity.Property(e => e.fecha_reunion).HasColumnType("date");
            entity.Property(e => e.observaciones).HasColumnType("text");
            entity.Property(e => e.resultado).HasMaxLength(50);

            entity.HasOne(d => d.clave_alumnoNavigation).WithMany(p => p.acta_comites)
                .HasForeignKey(d => d.clave_alumno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_acta_alumno");

            entity.HasOne(d => d.id_comiteNavigation).WithMany(p => p.acta_comites)
                .HasForeignKey(d => d.id_comite)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_acta_comite");

            entity.HasOne(d => d.id_revisionNavigation).WithMany(p => p.acta_comites)
                .HasForeignKey(d => d.id_revision)
                .HasConstraintName("fk_acta_revision");

            entity.HasOne(d => d.id_toeflNavigation).WithMany(p => p.acta_comites)
                .HasForeignKey(d => d.id_toefl)
                .HasConstraintName("fk_acta_toefl");
        });

        modelBuilder.Entity<acuerdo_evaluacion>(entity =>
        {
            entity.HasKey(e => e.id_acuerdo).HasName("PRIMARY");

            entity.ToTable("acuerdo_evaluacion");

            entity.HasIndex(e => e.id_revision, "fk_acuerdo_revision");

            entity.Property(e => e.cumplido).HasDefaultValueSql("'0'");
            entity.Property(e => e.descripcion).HasColumnType("text");
            entity.Property(e => e.fecha_compromiso).HasColumnType("date");

            entity.HasOne(d => d.id_revisionNavigation).WithMany(p => p.acuerdo_evaluacions)
                .HasForeignKey(d => d.id_revision)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_acuerdo_revision");
        });

        modelBuilder.Entity<alumno>(entity =>
        {
            entity.HasKey(e => e.clave_alumno).HasName("PRIMARY");

            entity.ToTable("alumno");

            entity.HasIndex(e => e.id_estado_academico, "fk_alumno_estado_academico");

            entity.HasIndex(e => e.id_generacion, "fk_alumno_generacion");

            entity.HasIndex(e => e.id_modalidad, "fk_alumno_modalidad");

            entity.HasIndex(e => e.id_programa, "fk_alumno_programa");

            entity.HasIndex(e => e.id_usuario, "fk_alumno_usuario");

            entity.Property(e => e.activo).HasDefaultValueSql("'1'");
            entity.Property(e => e.apellido_materno).HasMaxLength(50);
            entity.Property(e => e.apellido_paterno).HasMaxLength(50);
            entity.Property(e => e.correo_institucional).HasMaxLength(100);
            entity.Property(e => e.correo_personal).HasMaxLength(100);
            entity.Property(e => e.fecha_ingreso).HasColumnType("date");
            entity.Property(e => e.nombre).HasMaxLength(50);
            entity.Property(e => e.telefono).HasMaxLength(20);

            entity.HasOne(d => d.id_estado_academicoNavigation).WithMany(p => p.alumnos)
                .HasForeignKey(d => d.id_estado_academico)
                .HasConstraintName("fk_alumno_estado_academico");

            entity.HasOne(d => d.id_generacionNavigation).WithMany(p => p.alumnos)
                .HasForeignKey(d => d.id_generacion)
                .HasConstraintName("fk_alumno_generacion");

            entity.HasOne(d => d.id_modalidadNavigation).WithMany(p => p.alumnos)
                .HasForeignKey(d => d.id_modalidad)
                .HasConstraintName("fk_alumno_modalidad");

            entity.HasOne(d => d.id_programaNavigation).WithMany(p => p.alumnos)
                .HasForeignKey(d => d.id_programa)
                .HasConstraintName("fk_alumno_programa");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.alumnos)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("fk_alumno_usuario");
        });

        modelBuilder.Entity<alumno_detalle>(entity =>
        {
            entity.HasKey(e => e.id_alumno_detalle).HasName("PRIMARY");

            entity.ToTable("alumno_detalle");

            entity.HasIndex(e => e.id_periodo, "fk_detalle_periodo");

            entity.HasIndex(e => new { e.clave_alumno, e.id_periodo }, "uq_alumno_periodo").IsUnique();

            entity.Property(e => e.fecha_registro).HasColumnType("date");

            entity.HasOne(d => d.clave_alumnoNavigation).WithMany(p => p.alumno_detalles)
                .HasForeignKey(d => d.clave_alumno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_detalle_alumno");

            entity.HasOne(d => d.id_periodoNavigation).WithMany(p => p.alumno_detalles)
                .HasForeignKey(d => d.id_periodo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_detalle_periodo");
        });

        modelBuilder.Entity<comite>(entity =>
        {
            entity.HasKey(e => e.id_comite).HasName("PRIMARY");

            entity.ToTable("comite");

            entity.HasIndex(e => e.id_tesis, "fk_comite_tesis");

            entity.Property(e => e.tipo).HasMaxLength(50);

            entity.HasOne(d => d.id_tesisNavigation).WithMany(p => p.comites)
                .HasForeignKey(d => d.id_tesis)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_comite_tesis");
        });

        modelBuilder.Entity<comite_profesor>(entity =>
        {
            entity.HasKey(e => e.id_comite_profesor).HasName("PRIMARY");

            entity.ToTable("comite_profesor");

            entity.HasIndex(e => e.id_comite, "fk_cp_comite");

            entity.HasIndex(e => e.rpe, "fk_cp_profesor");

            entity.HasIndex(e => e.id_rol_comite, "fk_cp_rol");

            entity.Property(e => e.activo).HasDefaultValueSql("'1'");
            entity.Property(e => e.fecha_asignacion).HasColumnType("date");

            entity.HasOne(d => d.id_comiteNavigation).WithMany(p => p.comite_profesors)
                .HasForeignKey(d => d.id_comite)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_cp_comite");

            entity.HasOne(d => d.id_rol_comiteNavigation).WithMany(p => p.comite_profesors)
                .HasForeignKey(d => d.id_rol_comite)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_cp_rol");

            entity.HasOne(d => d.rpeNavigation).WithMany(p => p.comite_profesors)
                .HasForeignKey(d => d.rpe)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_cp_profesor");
        });

        modelBuilder.Entity<detalle_empleo>(entity =>
        {
            entity.HasKey(e => e.id_detalle_empleo).HasName("PRIMARY");

            entity.ToTable("detalle_empleo");

            entity.HasIndex(e => e.id_empleo, "fk_detempleo_empleo");

            entity.Property(e => e.fecha_final).HasColumnType("date");
            entity.Property(e => e.fecha_inicio).HasColumnType("date");
            entity.Property(e => e.puesto).HasMaxLength(100);
            entity.Property(e => e.sueldo).HasPrecision(10);

            entity.HasOne(d => d.id_empleoNavigation).WithMany(p => p.detalle_empleos)
                .HasForeignKey(d => d.id_empleo)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_detempleo_empleo");
        });

        modelBuilder.Entity<documento>(entity =>
        {
            entity.HasKey(e => e.id_documento).HasName("PRIMARY");

            entity.ToTable("documento");

            entity.HasIndex(e => e.cve_acta, "fk_doc_acta");

            entity.HasIndex(e => e.clave_alumno, "fk_doc_alumno");

            entity.HasIndex(e => e.id_revision, "fk_doc_revision");

            entity.HasIndex(e => e.id_tesis, "fk_doc_tesis");

            entity.HasIndex(e => e.id_tipo_documento, "fk_doc_tipo");

            entity.Property(e => e.cve_acta)
                .HasMaxLength(6)
                .IsFixedLength();
            entity.Property(e => e.fecha_carga)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.nombre_archivo).HasMaxLength(255);
            entity.Property(e => e.ruta_archivo).HasMaxLength(255);

            entity.HasOne(d => d.clave_alumnoNavigation).WithMany(p => p.documentos)
                .HasForeignKey(d => d.clave_alumno)
                .HasConstraintName("fk_doc_alumno");

            entity.HasOne(d => d.cve_actaNavigation).WithMany(p => p.documentos)
                .HasForeignKey(d => d.cve_acta)
                .HasConstraintName("fk_doc_acta");

            entity.HasOne(d => d.id_revisionNavigation).WithMany(p => p.documentos)
                .HasForeignKey(d => d.id_revision)
                .HasConstraintName("fk_doc_revision");

            entity.HasOne(d => d.id_tesisNavigation).WithMany(p => p.documentos)
                .HasForeignKey(d => d.id_tesis)
                .HasConstraintName("fk_doc_tesis");

            entity.HasOne(d => d.id_tipo_documentoNavigation).WithMany(p => p.documentos)
                .HasForeignKey(d => d.id_tipo_documento)
                .HasConstraintName("fk_doc_tipo");
        });

        modelBuilder.Entity<egresado>(entity =>
        {
            entity.HasKey(e => e.clave_alumno).HasName("PRIMARY");

            entity.ToTable("egresado");

            entity.HasIndex(e => e.id_estado_egresado, "fk_egresado_estado");

            entity.HasIndex(e => e.id_egresado, "id_egresado").IsUnique();

            entity.Property(e => e.ciudad).HasMaxLength(100);
            entity.Property(e => e.correo).HasMaxLength(100);
            entity.Property(e => e.fecha_egreso).HasColumnType("date");
            entity.Property(e => e.identificador_egresado).HasMaxLength(50);
            entity.Property(e => e.localizable).HasDefaultValueSql("'1'");
            entity.Property(e => e.telefono).HasMaxLength(20);
            entity.Property(e => e.ultima_actualizacion).HasColumnType("date");

            entity.HasOne(d => d.clave_alumnoNavigation).WithOne(p => p.egresado)
                .HasForeignKey<egresado>(d => d.clave_alumno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_egresado_alumno");

            entity.HasOne(d => d.id_estado_egresadoNavigation).WithMany(p => p.egresados)
                .HasForeignKey(d => d.id_estado_egresado)
                .HasConstraintName("fk_egresado_estado");
        });

        modelBuilder.Entity<empleo>(entity =>
        {
            entity.HasKey(e => e.id_empleo).HasName("PRIMARY");

            entity.ToTable("empleo");

            entity.HasIndex(e => e.clave_alumno, "fk_empleo_egresado");

            entity.HasIndex(e => e.id_empresa, "fk_empleo_empresa");

            entity.HasIndex(e => e.id_situacion_laboral, "fk_empleo_situacion");

            entity.Property(e => e.area_profesional).HasMaxLength(100);
            entity.Property(e => e.tipo).HasMaxLength(100);
            entity.Property(e => e.trabajo_actual).HasDefaultValueSql("'0'");

            entity.HasOne(d => d.clave_alumnoNavigation).WithMany(p => p.empleos)
                .HasForeignKey(d => d.clave_alumno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_empleo_egresado");

            entity.HasOne(d => d.id_empresaNavigation).WithMany(p => p.empleos)
                .HasForeignKey(d => d.id_empresa)
                .HasConstraintName("fk_empleo_empresa");

            entity.HasOne(d => d.id_situacion_laboralNavigation).WithMany(p => p.empleos)
                .HasForeignKey(d => d.id_situacion_laboral)
                .HasConstraintName("fk_empleo_situacion");
        });

        modelBuilder.Entity<empresa>(entity =>
        {
            entity.HasKey(e => e.id_empresa).HasName("PRIMARY");

            entity.ToTable("empresa");

            entity.Property(e => e.ciudad).HasMaxLength(100);
            entity.Property(e => e.estado).HasMaxLength(100);
            entity.Property(e => e.nombre).HasMaxLength(150);
            entity.Property(e => e.pais).HasMaxLength(100);
            entity.Property(e => e.sector).HasMaxLength(100);
        });

        modelBuilder.Entity<encuestum>(entity =>
        {
            entity.HasKey(e => e.id_encuesta).HasName("PRIMARY");

            entity.Property(e => e.activa).HasDefaultValueSql("'1'");
            entity.Property(e => e.fecha_creacion).HasColumnType("date");
            entity.Property(e => e.nombre).HasMaxLength(150);
            entity.Property(e => e.tipo).HasMaxLength(100);
        });

        modelBuilder.Entity<generacion>(entity =>
        {
            entity.HasKey(e => e.id_generacion).HasName("PRIMARY");

            entity.ToTable("generacion");

            entity.HasIndex(e => e.id_programa, "fk_generacion_programa");

            entity.Property(e => e.nombre_generacion).HasMaxLength(100);

            entity.HasOne(d => d.id_programaNavigation).WithMany(p => p.generacions)
                .HasForeignKey(d => d.id_programa)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_generacion_programa");
        });

        modelBuilder.Entity<intento_contacto>(entity =>
        {
            entity.HasKey(e => e.id_intento).HasName("PRIMARY");

            entity.ToTable("intento_contacto");

            entity.HasIndex(e => e.clave_alumno, "fk_intento_egresado");

            entity.Property(e => e.fecha_intento).HasColumnType("date");
            entity.Property(e => e.observaciones).HasColumnType("text");

            entity.HasOne(d => d.clave_alumnoNavigation).WithMany(p => p.intento_contactos)
                .HasForeignKey(d => d.clave_alumno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_intento_egresado");
        });

        modelBuilder.Entity<log_acceso>(entity =>
        {
            entity.HasKey(e => e.id_log).HasName("PRIMARY");

            entity.ToTable("log_acceso");

            entity.HasIndex(e => e.id_usuario, "fk_log_usuario");

            entity.Property(e => e.fecha)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.ip).HasMaxLength(45);
            entity.Property(e => e.resultado).HasMaxLength(20);

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.log_accesos)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("fk_log_usuario");
        });

        modelBuilder.Entity<opcion_preguntum>(entity =>
        {
            entity.HasKey(e => e.id_opcion).HasName("PRIMARY");

            entity.HasIndex(e => e.id_pregunta, "fk_opcion_pregunta");

            entity.Property(e => e.texto).HasMaxLength(255);

            entity.HasOne(d => d.id_preguntaNavigation).WithMany(p => p.opcion_pregunta)
                .HasForeignKey(d => d.id_pregunta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_opcion_pregunta");
        });

        modelBuilder.Entity<periodo_academico>(entity =>
        {
            entity.HasKey(e => e.id_periodo).HasName("PRIMARY");

            entity.ToTable("periodo_academico");

            entity.Property(e => e.fecha_fin).HasColumnType("date");
            entity.Property(e => e.fecha_inicio).HasColumnType("date");
            entity.Property(e => e.nombre).HasMaxLength(100);
            entity.Property(e => e.tipo_periodo).HasMaxLength(50);
        });

        modelBuilder.Entity<preguntum>(entity =>
        {
            entity.HasKey(e => e.id_pregunta).HasName("PRIMARY");

            entity.HasIndex(e => e.id_seccion, "fk_pregunta_seccion");

            entity.HasIndex(e => e.id_tipo_pregunta, "fk_pregunta_tipo");

            entity.Property(e => e.obligatoria).HasDefaultValueSql("'0'");
            entity.Property(e => e.texto).HasColumnType("text");

            entity.HasOne(d => d.id_seccionNavigation).WithMany(p => p.pregunta)
                .HasForeignKey(d => d.id_seccion)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_pregunta_seccion");

            entity.HasOne(d => d.id_tipo_preguntaNavigation).WithMany(p => p.pregunta)
                .HasForeignKey(d => d.id_tipo_pregunta)
                .HasConstraintName("fk_pregunta_tipo");
        });

        modelBuilder.Entity<profesor>(entity =>
        {
            entity.HasKey(e => e.rpe).HasName("PRIMARY");

            entity.ToTable("profesor");

            entity.Property(e => e.apellido_materno).HasMaxLength(50);
            entity.Property(e => e.apellido_paterno).HasMaxLength(50);
            entity.Property(e => e.nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<profesor_detalle>(entity =>
        {
            entity.HasKey(e => e.id_profesor_detalle).HasName("PRIMARY");

            entity.ToTable("profesor_detalle");

            entity.HasIndex(e => e.rpe, "fk_profdet_profesor");

            entity.HasIndex(e => e.id_usuario, "fk_profdet_usuario");

            entity.Property(e => e.activo).HasDefaultValueSql("'1'");
            entity.Property(e => e.correo_institucional).HasMaxLength(100);

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.profesor_detalles)
                .HasForeignKey(d => d.id_usuario)
                .HasConstraintName("fk_profdet_usuario");

            entity.HasOne(d => d.rpeNavigation).WithMany(p => p.profesor_detalles)
                .HasForeignKey(d => d.rpe)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_profdet_profesor");
        });

        modelBuilder.Entity<reporte>(entity =>
        {
            entity.HasKey(e => e.id_reporte).HasName("PRIMARY");

            entity.ToTable("reporte");

            entity.HasIndex(e => e.id_formato_reporte, "fk_reporte_formato");

            entity.HasIndex(e => e.id_tipo_reporte, "fk_reporte_tipo");

            entity.HasIndex(e => e.id_usuario_genero, "fk_reporte_usuario");

            entity.Property(e => e.fecha_generacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.filtros_usados).HasColumnType("text");
            entity.Property(e => e.ruta_archivo).HasMaxLength(255);

            entity.HasOne(d => d.id_formato_reporteNavigation).WithMany(p => p.reportes)
                .HasForeignKey(d => d.id_formato_reporte)
                .HasConstraintName("fk_reporte_formato");

            entity.HasOne(d => d.id_tipo_reporteNavigation).WithMany(p => p.reportes)
                .HasForeignKey(d => d.id_tipo_reporte)
                .HasConstraintName("fk_reporte_tipo");

            entity.HasOne(d => d.id_usuario_generoNavigation).WithMany(p => p.reportes)
                .HasForeignKey(d => d.id_usuario_genero)
                .HasConstraintName("fk_reporte_usuario");
        });

        modelBuilder.Entity<requisito_toefl>(entity =>
        {
            entity.HasKey(e => e.id_toefl).HasName("PRIMARY");

            entity.ToTable("requisito_toefl");

            entity.HasIndex(e => e.clave_alumno, "fk_toefl_alumno");

            entity.HasIndex(e => e.id_estado_toefl, "fk_toefl_estado");

            entity.Property(e => e.fecha_presentacion).HasColumnType("date");
            entity.Property(e => e.observaciones).HasColumnType("text");
            entity.Property(e => e.puntaje).HasPrecision(5);

            entity.HasOne(d => d.clave_alumnoNavigation).WithMany(p => p.requisito_toefls)
                .HasForeignKey(d => d.clave_alumno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_toefl_alumno");

            entity.HasOne(d => d.id_estado_toeflNavigation).WithMany(p => p.requisito_toefls)
                .HasForeignKey(d => d.id_estado_toefl)
                .HasConstraintName("fk_toefl_estado");
        });

        modelBuilder.Entity<respuesta_encuestum>(entity =>
        {
            entity.HasKey(e => e.id_respuesta_encuesta).HasName("PRIMARY");

            entity.HasIndex(e => e.clave_alumno, "fk_respenc_egresado");

            entity.HasIndex(e => e.id_encuesta, "fk_respenc_encuesta");

            entity.Property(e => e.completada).HasDefaultValueSql("'0'");
            entity.Property(e => e.fecha_envio).HasColumnType("datetime");
            entity.Property(e => e.fecha_inicio).HasColumnType("datetime");

            entity.HasOne(d => d.clave_alumnoNavigation).WithMany(p => p.respuesta_encuesta)
                .HasForeignKey(d => d.clave_alumno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_respenc_egresado");

            entity.HasOne(d => d.id_encuestaNavigation).WithMany(p => p.respuesta_encuesta)
                .HasForeignKey(d => d.id_encuesta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_respenc_encuesta");
        });

        modelBuilder.Entity<respuestum>(entity =>
        {
            entity.HasKey(e => e.id_respuesta).HasName("PRIMARY");

            entity.HasIndex(e => e.id_respuesta_encuesta, "fk_resp_envio");

            entity.HasIndex(e => e.id_opcion, "fk_resp_opcion");

            entity.HasIndex(e => e.id_pregunta, "fk_resp_pregunta");

            entity.Property(e => e.fecha_respuesta).HasColumnType("datetime");
            entity.Property(e => e.respuesta).HasColumnType("text");

            entity.HasOne(d => d.id_opcionNavigation).WithMany(p => p.respuesta)
                .HasForeignKey(d => d.id_opcion)
                .HasConstraintName("fk_resp_opcion");

            entity.HasOne(d => d.id_preguntaNavigation).WithMany(p => p.respuesta)
                .HasForeignKey(d => d.id_pregunta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_resp_pregunta");

            entity.HasOne(d => d.id_respuesta_encuestaNavigation).WithMany(p => p.respuesta)
                .HasForeignKey(d => d.id_respuesta_encuesta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_resp_envio");
        });

        modelBuilder.Entity<retroalimentacion_egresado>(entity =>
        {
            entity.HasKey(e => e.id_retroalimentacion).HasName("PRIMARY");

            entity.ToTable("retroalimentacion_egresado");

            entity.HasIndex(e => e.clave_alumno, "fk_retro_egresado");

            entity.Property(e => e.comentario).HasColumnType("text");
            entity.Property(e => e.fecha).HasColumnType("date");
            entity.Property(e => e.sugerencia).HasColumnType("text");

            entity.HasOne(d => d.clave_alumnoNavigation).WithMany(p => p.retroalimentacion_egresados)
                .HasForeignKey(d => d.clave_alumno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_retro_egresado");
        });

        modelBuilder.Entity<revision>(entity =>
        {
            entity.HasKey(e => e.id_revision).HasName("PRIMARY");

            entity.ToTable("revision");

            entity.HasIndex(e => e.id_periodo, "fk_revision_periodo");

            entity.HasIndex(e => e.id_tesis, "fk_revision_tesis");

            entity.Property(e => e.comentarios).HasColumnType("text");
            entity.Property(e => e.estado).HasMaxLength(50);
            entity.Property(e => e.fecha).HasColumnType("date");
            entity.Property(e => e.porcentaje_avance).HasPrecision(5);

            entity.HasOne(d => d.id_periodoNavigation).WithMany(p => p.revisions)
                .HasForeignKey(d => d.id_periodo)
                .HasConstraintName("fk_revision_periodo");

            entity.HasOne(d => d.id_tesisNavigation).WithMany(p => p.revisions)
                .HasForeignKey(d => d.id_tesis)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_revision_tesis");
        });

        modelBuilder.Entity<revision_profesor>(entity =>
        {
            entity.HasKey(e => e.id_revision_profesor).HasName("PRIMARY");

            entity.ToTable("revision_profesor");

            entity.HasIndex(e => e.rpe, "fk_rp_profesor");

            entity.HasIndex(e => e.id_revision, "fk_rp_revision");

            entity.Property(e => e.comentarios).HasColumnType("text");

            entity.HasOne(d => d.id_revisionNavigation).WithMany(p => p.revision_profesors)
                .HasForeignKey(d => d.id_revision)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_rp_revision");

            entity.HasOne(d => d.rpeNavigation).WithMany(p => p.revision_profesors)
                .HasForeignKey(d => d.rpe)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_rp_profesor");
        });

        modelBuilder.Entity<seccion_encuestum>(entity =>
        {
            entity.HasKey(e => e.id_seccion).HasName("PRIMARY");

            entity.HasIndex(e => e.id_encuesta, "fk_seccion_encuesta");

            entity.Property(e => e.nombre).HasMaxLength(150);

            entity.HasOne(d => d.id_encuestaNavigation).WithMany(p => p.seccion_encuesta)
                .HasForeignKey(d => d.id_encuesta)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_seccion_encuesta");
        });

        modelBuilder.Entity<tesi>(entity =>
        {
            entity.HasKey(e => e.id_tesis).HasName("PRIMARY");

            entity.ToTable("tesis");

            entity.HasIndex(e => e.clave_alumno, "fk_tesis_alumno");

            entity.HasIndex(e => e.id_estado_tesis, "fk_tesis_estado");

            entity.HasIndex(e => e.id_programa, "fk_tesis_programa");

            entity.Property(e => e.fecha_registro).HasColumnType("date");
            entity.Property(e => e.porcentaje_actual).HasPrecision(5);
            entity.Property(e => e.titulo).HasMaxLength(255);

            entity.HasOne(d => d.clave_alumnoNavigation).WithMany(p => p.tesis)
                .HasForeignKey(d => d.clave_alumno)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_tesis_alumno");

            entity.HasOne(d => d.id_estado_tesisNavigation).WithMany(p => p.tesis)
                .HasForeignKey(d => d.id_estado_tesis)
                .HasConstraintName("fk_tesis_estado");

            entity.HasOne(d => d.id_programaNavigation).WithMany(p => p.tesis)
                .HasForeignKey(d => d.id_programa)
                .HasConstraintName("fk_tesis_programa");
        });

        modelBuilder.Entity<token_recuperacion>(entity =>
        {
            entity.HasKey(e => e.id_token).HasName("PRIMARY");

            entity.ToTable("token_recuperacion");

            entity.HasIndex(e => e.id_usuario, "fk_token_usuario");

            entity.HasIndex(e => e.token, "token").IsUnique();

            entity.Property(e => e.fecha_expiracion).HasColumnType("datetime");
            entity.Property(e => e.usado).HasDefaultValueSql("'0'");

            entity.HasOne(d => d.id_usuarioNavigation).WithMany(p => p.token_recuperacions)
                .HasForeignKey(d => d.id_usuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_token_usuario");
        });

        modelBuilder.Entity<usuario>(entity =>
        {
            entity.HasKey(e => e.id_usuario).HasName("PRIMARY");

            entity.ToTable("usuario");

            entity.HasIndex(e => e.correo, "correo").IsUnique();

            entity.HasIndex(e => e.id_rol_usuario, "fk_usuario_rol");

            entity.Property(e => e.activo).HasDefaultValueSql("'1'");
            entity.Property(e => e.bloqueado_hasta).HasColumnType("datetime");
            entity.Property(e => e.contrasena_hash).HasMaxLength(255);
            entity.Property(e => e.correo).HasMaxLength(100);
            entity.Property(e => e.fecha_creacion)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.intentos_fallidos).HasDefaultValueSql("'0'");
            entity.Property(e => e.requiere_cambio).HasDefaultValueSql("'0'");
            entity.Property(e => e.ultimo_acceso).HasColumnType("datetime");

            entity.HasOne(d => d.id_rol_usuarioNavigation).WithMany(p => p.usuarios)
                .HasForeignKey(d => d.id_rol_usuario)
                .HasConstraintName("fk_usuario_rol");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
