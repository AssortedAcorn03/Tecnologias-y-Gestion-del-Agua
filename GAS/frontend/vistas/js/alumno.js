// ==================================================
// PANEL DEL ALUMNO
// ==================================================


// ==================================================
// ELEMENTOS DEL MENÚ
// ==================================================

const tesisMenu =
    document.getElementById("tesisMenu");

const tesisSubmenu =
    document.getElementById("tesisSubmenu");

const tesisArrow =
    document.getElementById("tesisArrow");

const miTesisButton =
    document.getElementById("miTesisButton");

const inicioAlumnoButton =
    document.getElementById("inicioAlumnoButton");

const perfilAlumnoButton =
    document.getElementById("perfilAlumnoButton");

const encuestasButton =
    document.getElementById("encuestasButton");

const reportesAlumnoButton =
    document.getElementById("reportesAlumnoButton");

const ayudaAlumnoButton =
    document.getElementById("ayudaAlumnoButton");

const cerrarSesionAlumnoButton =
    document.getElementById("cerrarSesionAlumnoButton");

const contentArea =
    document.getElementById("contentArea");


// ==================================================
// MENÚ TESIS
// ==================================================

tesisMenu.addEventListener("click", function () {

    tesisSubmenu.classList.toggle("open");

    tesisMenu.classList.toggle("expanded");

});

// ==================================================
// MI TESIS
// ==================================================

miTesisButton.addEventListener("click", function (event) {

    event.stopPropagation();

    // Quitar selección anterior
    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });

    // Marcar Mi tesis
    miTesisButton.classList.add("active");

    mostrarMiTesis();

});
// ==================================================
// VISTA MI TESIS
// ==================================================

function mostrarMiTesis() {

    contentArea.innerHTML = `

        <div class="thesis-page">

            <!-- ==========================================
                 ENCABEZADO
            =========================================== -->

            <div class="thesis-header">

                <h2>
                    Mi tesis
                </h2>

                <p>
                    Consulta la información de tu tesis.
                    Completa los datos requeridos para registrar
                    tu tesis en el sistema.
                </p>

            </div>


            <!-- ==========================================
                 DATOS DEL TESISTA
            =========================================== -->

            <section class="thesis-card">

                <div class="thesis-card-header">

                    <h3>
                        Datos del tesista
                    </h3>

                </div>


                <div class="thesis-student-fields">


                    <!-- CLAVE -->

                    <div class="thesis-readonly-field">

                        <label>
                            Clave del alumno
                        </label>

                        <div class="readonly-wrapper">

                            <input
                                type="text"
                                value="MTGA-2023-001"
                                readonly>

                            <span class="readonly-icon">
                                🔒
                            </span>

                        </div>

                    </div>


                    <!-- NOMBRE -->

                    <div class="thesis-readonly-field">

                        <label>
                            Nombre del tesista
                        </label>

                        <div class="readonly-wrapper">

                            <input
                                type="text"
                                value="Javier Pérez Martínez"
                                readonly>

                            <span class="readonly-icon">
                                🔒
                            </span>

                        </div>

                    </div>


                    <!-- PROGRAMA -->

                    <div class="thesis-readonly-field">

                        <label>
                            Programa académico
                        </label>

                        <div class="readonly-wrapper">

                            <input
                                type="text"
                                value="Maestría en Tecnología y Gestión del Agua"
                                readonly>

                            <span class="readonly-icon">
                                🔒
                            </span>

                        </div>

                    </div>


                    <!-- GENERACIÓN -->

                    <div class="thesis-readonly-field">

                        <label>
                            Generación
                        </label>

                        <div class="readonly-wrapper">

                            <input
                                type="text"
                                value="2023-2025"
                                readonly>

                            <span class="readonly-icon">
                                🔒
                            </span>

                        </div>

                    </div>


                </div>

            </section>


            <!-- ==========================================
                 INFORMACIÓN DE LA TESIS
            =========================================== -->

            <section class="thesis-card">

                <div class="thesis-card-header">

                    <h3>
                        Información de la tesis
                    </h3>

                    <p>
                        Ingresa la información de tu tesis.
                        Todos los campos son obligatorios.
                    </p>

                </div>


                <!-- TÍTULO -->

                <div class="thesis-form-group">

                    <label>
                        Título de la tesis
                        <span>*</span>
                    </label>

                    <input
                        type="text"
                        id="tituloTesis"
                        placeholder="Ingresa el título de tu tesis"
                        maxlength="255">

                    <div class="character-counter">
                        <span id="tituloCounter">0</span> / 255
                    </div>

                </div>


                <!-- RESUMEN -->

                <div class="thesis-form-group">

                    <label>
                        Resumen de la tesis
                        <span>*</span>
                    </label>

                    <textarea
                        id="resumenTesis"
                        placeholder="Ingresa un resumen de tu tesis"
                        maxlength="1000"></textarea>

                    <div class="character-counter">
                        <span id="resumenCounter">0</span> / 1000
                    </div>

                </div>


                <!-- DOCUMENTO -->

                <div class="thesis-form-group">

                    <label>
                        Documento de protocolo de tesis
                        <span>*</span>
                    </label>


                    <div class="file-upload-area">

                        <div class="file-upload-info">

                            <div class="upload-icon">
                                ↑
                            </div>

                            <div>

                                <strong>
                                    Selecciona un archivo PDF
                                </strong>

                                <span>
                                    Tamaño máximo: 10 MB
                                </span>

                            </div>

                        </div>


                        <label
                            for="protocoloTesis"
                            class="browse-button">

                            Examinar

                        </label>


                        <input
                            type="file"
                            id="protocoloTesis"
                            accept=".pdf"
                            hidden>

                    </div>


                    <div
                        id="selectedFileName"
                        class="selected-file-name">
                    </div>

                </div>

            </section>


            <!-- ==========================================
                 ESTADO DE SEGUIMIENTO
            =========================================== -->

            <section class="thesis-card">

                <div class="thesis-card-header">

                    <h3>
                        Estado de seguimiento
                    </h3>

                    <p>
                        Esta información es gestionada por el comité
                        tutorial y se actualizará conforme avancen
                        las evaluaciones.
                    </p>

                </div>


                <div class="thesis-followup-grid">


                    <!-- ESTADO -->

                    <div class="thesis-readonly-field">

                        <label>
                            Estado de tesis
                        </label>

                        <div class="readonly-wrapper">

                            <input
                                type="text"
                                value="Sin iniciar"
                                readonly>

                            <span class="readonly-icon">
                                🔒
                            </span>

                        </div>

                    </div>


                    <!-- PORCENTAJE -->

                    <div class="thesis-readonly-field">

                        <label>
                            Porcentaje de avance
                        </label>

                        <div class="readonly-wrapper">

                            <input
                                type="text"
                                value="0 %"
                                readonly>

                            <span class="readonly-icon">
                                🔒
                            </span>

                        </div>

                    </div>


                    <!-- FECHA REGISTRO -->

                    <div class="thesis-readonly-field">

                        <label>
                            Fecha de registro
                        </label>

                        <div class="readonly-wrapper">

                            <input
                                type="text"
                                value="15/05/2025"
                                readonly>

                            <span class="readonly-icon">
                                🔒
                            </span>

                        </div>

                    </div>


                    <!-- ÚLTIMA ACTUALIZACIÓN -->

                    <div class="thesis-readonly-field">

                        <label>
                            Última actualización
                        </label>

                        <div class="readonly-wrapper">

                            <input
                                type="text"
                                value="15/05/2025"
                                readonly>

                            <span class="readonly-icon">
                                🔒
                            </span>

                        </div>

                    </div>


                </div>


                <!-- AVISO -->

                <div class="thesis-information">

                    <span class="thesis-information-icon">
                        i
                    </span>

                    <span>
                        Una vez registrada la tesis, el porcentaje de
                        avance y el estado serán actualizados por el
                        comité tutorial mediante las evaluaciones
                        periódicas.
                    </span>

                </div>

            </section>


            <!-- ==========================================
                 BOTONES
            =========================================== -->

            <div class="thesis-actions">

                <button
                    type="button"
                    class="thesis-cancel-button">

                    Cancelar

                </button>


                <button
                    type="button"
                    class="thesis-save-button">

                    Registrar tesis

                </button>

            </div>

        </div>

    `;


    // ==========================================
    // CONTADORES
    // ==========================================

    const tituloTesis =
        document.getElementById("tituloTesis");

    const tituloCounter =
        document.getElementById("tituloCounter");

    const resumenTesis =
        document.getElementById("resumenTesis");

    const resumenCounter =
        document.getElementById("resumenCounter");


    tituloTesis.addEventListener("input", function () {

        tituloCounter.textContent =
            tituloTesis.value.length;

    });


    resumenTesis.addEventListener("input", function () {

        resumenCounter.textContent =
            resumenTesis.value.length;

    });


    // ==========================================
    // ARCHIVO PDF
    // ==========================================

    const protocoloTesis =
        document.getElementById("protocoloTesis");

    const selectedFileName =
        document.getElementById("selectedFileName");


    protocoloTesis.addEventListener("change", function () {

        if (protocoloTesis.files.length > 0) {

            selectedFileName.textContent =
                "Archivo seleccionado: " +
                protocoloTesis.files[0].name;

        } else {

            selectedFileName.textContent = "";

        }

    });

}




// ==================================================
// INICIO
// ==================================================

inicioAlumnoButton.addEventListener("click", function () {

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    inicioAlumnoButton.classList.add("active");


    contentArea.innerHTML = "";

});


// ==================================================
// MI PERFIL
// ==================================================

perfilAlumnoButton.addEventListener("click", function () {

    // Quitar selección anterior
    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    // Marcar Mi perfil como activo
    perfilAlumnoButton.classList.add("active");


    // Mostrar información del alumno
    contentArea.innerHTML = `

        <div class="profile-page">

            <!-- ==========================================
                 ENCABEZADO
            =========================================== -->

            <div class="profile-header">

                <h2>
                    Mi perfil
                </h2>

                <p>
                    Consulta la información registrada del alumno.
                </p>

            </div>


            <!-- ==========================================
                 INFORMACIÓN DEL ALUMNO
            =========================================== -->

            <section class="profile-card">

                <div class="profile-card-title">

                    <h3>
                        Información del alumno
                    </h3>

                </div>


                <div class="profile-fields">


                    <!-- CLAVE DEL ALUMNO -->

                    <div class="profile-field">

                        <label>
                            Clave del alumno
                        </label>

                        <input
                            type="text"
                            value="000000"
                            readonly>

                    </div>


                    <!-- NOMBRE -->

                    <div class="profile-field">

                        <label>
                            Nombre
                        </label>

                        <input
                            type="text"
                            value="aaaaaaaaa"
                            readonly>

                    </div>


                    <!-- APELLIDOS -->

                    <div class="profile-field">

                        <label>
                            Apellidos
                        </label>

                        <input
                            type="text"
                            value="aaaaaaa sssssss"
                            readonly>

                    </div>


                    <!-- GENERACIÓN -->

                    <div class="profile-field">

                        <label>
                            Generación
                        </label>

                        <input
                            type="text"
                            value="20--"
                            readonly>

                    </div>


                    <!-- SEMESTRE -->

                    <div class="profile-field">

                        <label>
                            Semestre
                        </label>

                        <input
                            type="text"
                            value="0"
                            readonly>

                    </div>


                    <!-- ESTADO ACADÉMICO -->

                    <div class="profile-field">

                        <label>
                            Estado académico
                        </label>

                        <input
                            type="text"
                            value="Activo"
                            readonly>

                    </div>


                </div>

            </section>


            <!-- ==========================================
                 OPCIONES DEL ALUMNO
            =========================================== -->

            <section class="profile-options">

                <div class="profile-options-title">

                    <h3>
                        Opciones
                    </h3>

                </div>


                <div class="profile-buttons">

                    <button
                        type="button"
                        class="profile-action-button"
                        id="estadoTitulacionButton">

                        Registro de modalidad de titulacion

                    </button>


                    <button
                        type="button"
                        class="profile-action-button"
                        id="seguimientoToeflButton">

                        Seguimiento TOEFL

                    </button>

                </div>

            </section>

        </div>

    `;


    // ==============================================
    // BOTONES DE OPCIONES
    // ==============================================

    const estadoTitulacionButton =
        document.getElementById("estadoTitulacionButton");

    const seguimientoToeflButton =
        document.getElementById("seguimientoToeflButton");


    // Por ahora solamente visual.
    // Las vistas se implementarán posteriormente.

   estadoTitulacionButton.addEventListener("click", function () {

    contentArea.innerHTML = `

        <div class="degree-page">

            <div class="degree-header">

                <h2>
                    Agregar estado de titulación
                </h2>

                <p>
                    Selecciona la modalidad de titulación correspondiente.
                </p>

            </div>


            <section class="degree-card">

                <h3>
                    Modalidad de titulación
                </h3>


                <p class="degree-description">
                    Selecciona una de las modalidades disponibles.
                </p>


                <div class="degree-options">

                    <button
                        type="button"
                        class="degree-option"
                        id="tesisOption">

                        <strong>
                            Tesis
                        </strong>

                        <span>
                            Modalidad de titulación mediante
                            elaboración y defensa de una tesis.
                        </span>

                    </button>


                    <button
                        type="button"
                        class="degree-option"
                        id="articuloOption">

                        <strong>
                            Artículo científico
                        </strong>

                        <span>
                            Modalidad de titulación mediante
                            publicación de un artículo científico.
                        </span>

                    </button>

                </div>

            </section>

        </div>

    `;


    // ==========================================
    // OPCIONES
    // ==========================================

    const tesisOption =
        document.getElementById("tesisOption");

    const articuloOption =
        document.getElementById("articuloOption");


    // ==========================================
    // TESIS
    // ==========================================

    tesisOption.addEventListener("click", function () {

        activarMenuTesis();

        // Por ahora regresamos a Mi perfil
        mostrarPerfilAlumno();

    });


    // ==========================================
    // ARTÍCULO CIENTÍFICO
    // ==========================================

    articuloOption.addEventListener("click", function () {

        // Por ahora solamente visual.
        // Más adelante podemos crear
        // los controles correspondientes.

        alert("Modalidad seleccionada: Artículo científico");

    });

});


    seguimientoToeflButton.addEventListener("click", function () {

        const dialogId = "seguimientoToeflDialog";
        let seguimientoToeflDialog =
            document.getElementById(dialogId);

        if (!seguimientoToeflDialog) {
            seguimientoToeflDialog = document.createElement("dialog");
            seguimientoToeflDialog.id = dialogId;
            seguimientoToeflDialog.className = "toefl-dialog";
            seguimientoToeflDialog.setAttribute(
                "aria-labelledby",
                "seguimientoToeflDialogTitle"
            );

            seguimientoToeflDialog.innerHTML = `

                <div class="toefl-dialog-header">

                    <h2 id="seguimientoToeflDialogTitle">
                        Requisitos para el examen
                    </h2>

                    <button
                        type="button"
                        class="toefl-dialog-close"
                        aria-label="Cerrar requisitos para el examen">
                        ×
                    </button>

                </div>

                <div class="toefl-dialog-content">

                    <ol>

                        <li>
                            Realizar pago del examen por
                            <strong>56.50 dólares (*)</strong> en cualquier
                            sucursal <strong>Banamex</strong> a la cuenta
                            <strong>4536-9000083</strong>.

                            <p>
                                El pago deberá realizarse únicamente
                                <strong>en ventanilla (**)</strong> dentro del
                                periodo de fechas marcado en el mes de su
                                interés.
                            </p>

                            <p>
                                Favor de solicitar al cajero que anote el
                                nombre completo del participante en la
                                referencia.
                            </p>
                        </li>

                        <li>
                            Traer el comprobante de pago original a la oficina
                            de administración de Centro de Idiomas en Zona
                            Universitaria (entre Facultad del Hábitat y
                            Ciencias Químicas), entre 8am y 2pm de lunes a
                            viernes antes de la fecha límite.
                        </li>

                        <li>
                            Presentarse 15 minutos antes de la hora señalada
                            del día del examen con lápiz del No. 2HB, goma e
                            identificación.
                        </li>

                    </ol>

                    <div class="toefl-dialog-notes">

                        <p>
                            (*) El costo podría variar según lo informe la
                            unidad gestora de exámenes y, de ser así, se
                            publicaría de inmediato en esta página.
                        </p>

                        <p>
                            (**) A menos que se especifique que se pague
                            directamente en oficinas de Centro de Idiomas.
                        </p>

                    </div>
                    </font></div><div style="text-align: left;">
                     </div><p style="text-align: center; line-height: 1;" class="titulo1"><span style="font-size: 24px; color: rgb(0, 74, 152); font-family: OpenSans-Bold;">FECHAS DE EXAMEN TOEFL AÑO 2026</span></p><table class="table paginas-tb__striped JCLRFlex JColResizer table-bordered" id="JColResizer0" style="text-align: center; width: 876.094px; min-width: 843.891px;"><tbody><tr><td style="text-align: center; width: 298.047px;"><b><font color="#003771">Fecha de examen</font></b></td><td style="text-align: center; width: 304.297px;"><p><b><font color="#003771"><span style="font-size: 18px;">Periodo para entregar comprobante de pago original en Dirección de C.I.U</span></font></b></p></td><td style="text-align: center; width: 272.75px;"><p class="titulo2" style="line-height: 1;"><b><span style="font-size: 18px; font-family: OpenSans-Light;">Entrega</span></b><b style="font-family: OpenSans-Light; font-size: 18px; background-color: var(--bs-table-bg);">&nbsp;de Certificados<br></b><span style="font-size: 18px; color: rgb(32, 128, 203); font-family: OpenSans-Light; background-color: var(--bs-table-bg); font-weight: var(--bs-body-font-weight);">Acudir a oficinas de C.I.U. en Zona Univ. de 7am a 3pm L-V</span></p><p></p></td></tr><tr><td style="text-align: center; width: 298.047px;">Junio 1</td><td style="text-align: center; width: 304.297px;"><b>-<br></b></td><td style="text-align: center; width: 272.75px;"><b>Junio 16</b></td></tr><tr><td style="text-align: center; width: 298.047px;">Junio 26</td><td style="text-align: center; width: 304.297px;"><b>-</b></td><td style="text-align: center; width: 272.75px;"><b>Julio 16</b></td></tr><tr><td style="text-align: center; width: 298.047px;">Julio 23</td><td style="text-align: center; width: 304.297px;"><b>-</b></td><td style="text-align: center; width: 272.75px;"><b>Octubre 07</b></td></tr><tr><td style="text-align: center; width: 298.047px;">Agosto 28</td><td style="text-align: center; width: 304.297px;"><b>-</b></td><td style="text-align: center; width: 272.75px;"><b>Octubre 07</b></td></tr><tr><td style="text-align: center; width: 298.047px;">Septiembre 25</td><td style="text-align: center; width: 304.297px;"><b>-</b></td><td style="text-align: center; width: 272.75px;"><b>Pendiente</b></td></tr><tr><td style="text-align: center; width: 298.047px;"><b>Octubre 30</b></td><td style="text-align: center; width: 304.297px;"><b>12 a 16 de octubre</b></td><td style="text-align: center; width: 272.75px;"><b>-</b></td></tr><tr><td style="text-align: center; width: 298.047px;"><b>Noviembre 27</b></td><td style="text-align: center; width: 304.297px;"><b>9 a 13 de noviembre</b></td><td style="text-align: center; width: 272.75px;"><b>-</b></td></tr></tbody></table><div style="text-align: left;"><font color="#2080cb"><b>° Ultima actualización: Julio 16, 2026</b></font></div><div style="text-align: left;"><br></div><div style="text-align: left;"><img src="https://adminportal.uaslp.mx//ImgEntidad/59/Paginas/28-11-2025_96_Icono pdf_file_icon_256313.png" class="img-fluid p-2" style=""><a href="https://www.ets.org/pdfs/toefl-itp-test-taker-handbook.pdf"><b>Manual de referencia para presentar el examen TOEFL ITP</b></a></div><div style="text-align: left;"><br></div><p style="text-align: left;" class="descripcion-azul"><b>NOTAS:

                    </b></p><div style="text-align: left;">
</div><ul><li>El examen está sujeto a un mínimo de 20 candidatos. Si el candidato no se presenta al examen o llega tarde NO hay devolución de pago, ni cambio de fecha.</li><li> Si el candidato es de otra ciudad o de otro estado, favor de mandar su recibo de pago escaneado al correo <b>ciu.certificaciones@uaslp.mx</b>, confirmar vía telefónica que haya sido recibido y el día del examen TRAER EL RECIBO ORIGINAL DE PAGO. </li><li>El pago del examen deberá realizarse exclusivamente en el periodo especificado en la lista siguiente (en el mismo mes en que se aplicará el examen).</li><li style="">Horario regular de aplicación de examen: 10:00 y 15:00 hrs.</li></ul><p style="text-align: left;"><font style="" color="#003771"><b>Más información, al teléfono 444-8261313 <u>extensión 1614 </u>de lunes a viernes en horario de 8am-2pm. Podrá enviar también un correo electrónico a ciu.certificaciones@uaslp.mx&nbsp;<br></b></font><br></p><div style="text-align: left;">
</div><div style="text-align: left;">

                </div>

            `;

            document.body.appendChild(seguimientoToeflDialog);

            seguimientoToeflDialog
                .querySelector(".toefl-dialog-close")
                .addEventListener("click", function () {
                    seguimientoToeflDialog.close();
                });
        }

        seguimientoToeflDialog.showModal();

    });

});

// ==================================================
// ENCUESTAS Y FORMULARIOS
// ==================================================

encuestasButton.addEventListener("click", function () {

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    encuestasButton.classList.add("active");


    contentArea.innerHTML = `

        <div class="student-content-placeholder">

            <h2>
                Encuestas y formularios
            </h2>

        </div>

    `;

});
// ==================================================
// ACTIVAR MENÚ TESIS
// ==================================================

function activarMenuTesis() {

    const tesisSection =
        document.getElementById("tesisSection");


    tesisSection.classList.add("visible");

}

// ==================================================
// REPORTES
// ==================================================

reportesAlumnoButton.addEventListener("click", function () {

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    reportesAlumnoButton.classList.add("active");


    contentArea.innerHTML = `

        <div class="student-content-placeholder">

            <h2>
                Reportes
            </h2>

        </div>

    `;

});


// ==================================================
// AYUDA
// ==================================================

ayudaAlumnoButton.addEventListener("click", function () {

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    ayudaAlumnoButton.classList.add("active");


    contentArea.innerHTML = `

        <div class="student-content-placeholder">

            <h2>
                Ayuda
            </h2>

        </div>

    `;

});


// ==================================================
// CERRAR SESIÓN
// ==================================================

cerrarSesionAlumnoButton.addEventListener("click", function () {

    // Por ahora solamente visual.
    // La funcionalidad real se agregará posteriormente.

    console.log("Cerrar sesión");

});