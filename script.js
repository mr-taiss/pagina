/* =====================================================
   SISGOP
   SISTEMA DE GESTIÓN DE OBJETOS PERDIDOS
   6TO A
===================================================== */

const STORAGE_KEY = "sisgop_objects";

let objects = [];

let editingId = null;

let currentFilter = "Todos";

let currentImage = "";


/* =====================================================
   INICIO
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadObjects();

        setToday();

        setupForm();

        setupImagePreview();

        updateAll();

        showScreen("welcomeScreen");

    }
);


/* =====================================================
   NAVEGACIÓN
===================================================== */

function showScreen(id) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const screen =
        document.getElementById(id);


    if (screen) {

        screen.classList.add("active");

        window.scrollTo(0, 0);

    }

}


/* =====================================================
   ENTRAR AL SISTEMA
===================================================== */

function enterSystem() {

    updateAll();

    showScreen("homeScreen");

}


/* =====================================================
   VOLVER A PORTADA
===================================================== */

function returnToWelcome() {

    showScreen("welcomeScreen");

}


/* =====================================================
   ABRIR PANTALLAS
===================================================== */

function openHome() {

    updateAll();

    showScreen("homeScreen");

}


function openRegister() {

    resetForm();

    showScreen("registerScreen");

}


function openSearch() {

    document.getElementById(
        "searchInput"
    ).value = "";

    document.getElementById(
        "searchStatus"
    ).value = "Todos";

    searchObjects();

    showScreen("searchScreen");

}


function openObjects() {

    currentFilter = "Todos";

    document
        .querySelectorAll(".filter-button")
        .forEach(button => {

            button.classList.remove("active");

        });


    const firstFilter =
        document.querySelector(
            ".filter-button"
        );


    if (firstFilter) {

        firstFilter.classList.add("active");

    }


    renderObjects();

    showScreen("objectsScreen");

}


function openNotifications() {

    renderNotifications();

    showScreen("notificationsScreen");

}


/* =====================================================
   CARGAR DATOS
===================================================== */

function loadObjects() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        objects = [];

        return;

    }


    try {

        objects =
            JSON.parse(saved);


        objects.forEach(object => {

            if (
                !object.status ||
                object.status === "Pendiente"
            ) {

                object.status = "Perdido";

            }


            if (!object.history) {

                object.history = [];

            }

        });


        saveObjects();

    } catch (error) {

        objects = [];

    }

}


/* =====================================================
   GUARDAR
===================================================== */

function saveObjects() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(objects)
    );

}


/* =====================================================
   FECHA ACTUAL
===================================================== */

function setToday() {

    const input =
        document.getElementById(
            "objectDate"
        );


    if (!input) return;


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    input.value =
        `${year}-${month}-${day}`;

}


/* =====================================================
   FORMULARIO
===================================================== */

function setupForm() {

    const form =
        document.getElementById(
            "objectForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        saveObject
    );

}


/* =====================================================
   REINICIAR FORMULARIO
===================================================== */

function resetForm() {

    const form =
        document.getElementById(
            "objectForm"
        );


    form.reset();


    editingId = null;

    currentImage = "";


    document.getElementById(
        "formTitle"
    ).textContent =
        "Registrar objeto";


    const preview =
        document.getElementById(
            "imagePreview"
        );


    preview.innerHTML = "";

    preview.classList.remove(
        "visible"
    );


    setToday();

}


/* =====================================================
   IMAGEN
===================================================== */

function setupImagePreview() {

    const input =
        document.getElementById(
            "objectImage"
        );


    if (!input) return;


    input.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) return;


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    currentImage =
                        event.target.result;


                    const preview =
                        document.getElementById(
                            "imagePreview"
                        );


                    preview.innerHTML = `

                        <img
                            src="${currentImage}"
                            alt="Vista previa">

                    `;


                    preview.classList.add(
                        "visible"
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =====================================================
   GUARDAR OBJETO
===================================================== */

function saveObject(event) {

    event.preventDefault();


    const type =
        document.getElementById(
            "objectType"
        ).value;


    const name =
        document.getElementById(
            "objectName"
        ).value.trim();


    const description =
        document.getElementById(
            "objectDescription"
        ).value.trim();


    const date =
        document.getElementById(
            "objectDate"
        ).value;


    const place =
        document.getElementById(
            "objectPlace"
        ).value.trim();


    const student =
        document.getElementById(
            "studentName"
        ).value.trim();


    if (
        !name ||
        !description ||
        !date ||
        !place
    ) {

        showToast(
            "Completa los campos obligatorios.",
            "error"
        );

        return;

    }


    /* EDITAR */

    if (editingId !== null) {

        const object =
            objects.find(
                item =>
                    item.id === editingId
            );


        if (!object) return;


        object.name =
            name;

        object.description =
            description;

        object.date =
            date;

        object.place =
            place;

        object.student =
            student;


        if (currentImage) {

            object.image =
                currentImage;

        }


        addHistory(
            object,
            "Información del objeto editada."
        );


        saveObjects();

        updateAll();


        showToast(
            "Objeto actualizado correctamente.",
            "success"
        );


        openObjects();

        return;

    }


    /* NUEVO OBJETO */

    const newObject = {

        id:
            generateId(),

        name:
            name,

        description:
            description,

        date:
            date,

        place:
            place,

        student:
            student,

        image:
            currentImage,

        status:
            type,

        createdAt:
            new Date().toISOString(),

        history: []

    };


    addHistory(
        newObject,
        `Objeto registrado como ${type}.`
    );


    objects.push(
        newObject
    );


    saveObjects();

    updateAll();


    showToast(
        "Objeto registrado correctamente.",
        "success"
    );


    resetForm();

    openObjects();

}


/* =====================================================
   ID
===================================================== */

function generateId() {

    if (
        objects.length === 0
    ) {

        return "001";

    }


    const numbers =
        objects.map(
            object =>
                parseInt(
                    object.id
                ) || 0
        );


    return String(
        Math.max(...numbers) + 1
    ).padStart(3, "0");

}


/* =====================================================
   HISTORIAL
===================================================== */

function addHistory(
    object,
    message
) {

    if (!object.history) {

        object.history = [];

    }


    object.history.push({

        message:
            message,

        date:
            new Date()
                .toLocaleString("es-BO")

    });

}


/* =====================================================
   ACTUALIZAR TODO
===================================================== */

function updateAll() {

    updateStatistics();

    renderObjects();

    searchObjects();

    renderNotifications();

}


/* =====================================================
   ESTADÍSTICAS
===================================================== */

function updateStatistics() {

    const lost =
        objects.filter(
            object =>
                object.status === "Perdido"
        ).length;


    const found =
        objects.filter(
            object =>
                object.status === "Encontrado"
        ).length;


    const recovered =
        objects.filter(
            object =>
                object.status === "Recuperado"
        ).length;


    document.getElementById(
        "lostCount"
    ).textContent = lost;


    document.getElementById(
        "foundCount"
    ).textContent = found;


    document.getElementById(
        "recoveredCount"
    ).textContent = recovered;


    const notifications =
        objects.filter(
            object =>
                object.status === "Encontrado"
        ).length;


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    badge.textContent =
        notifications;


    badge.classList.toggle(
        "zero",
        notifications === 0
    );

}


/* =====================================================
   ESTADOS
===================================================== */

function statusHTML(status) {

    let className = "";

    let symbol = "";


    if (
        status === "Perdido"
    ) {

        className = "perdido";

        symbol = "•";

    }


    if (
        status === "Encontrado"
    ) {

        className = "encontrado";

        symbol = "✓";

    }


    if (
        status === "Recuperado"
    ) {

        className = "recuperado";

        symbol = "↗";

    }


    return `

        <span
            class="status ${className}">

            ${symbol}
            ${status}

        </span>

    `;

}


/* =====================================================
   FECHA
===================================================== */

function formatDate(date) {

    if (!date) return "-";


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    return `
        ${parts[2]}/${parts[1]}/${parts[0]}
    `;

}


/* =====================================================
   FILA TABLA
===================================================== */

function createTableRow(object) {

    let actions = `

        <button
            class="table-action"
            onclick="viewDetails('${object.id}')">

            Ver

        </button>

    `;


    if (
        object.status === "Perdido"
    ) {

        actions += `

            <button
                class="table-action found"
                onclick="markFound('${object.id}')">

                Encontrado

            </button>

        `;

    }


    if (
        object.status === "Encontrado"
    ) {

        actions += `

            <button
                class="table-action recover"
                onclick="markRecovered('${object.id}')">

                Recuperado

            </button>

        `;

    }


    actions += `

        <button
            class="table-action edit"
            onclick="editObject('${object.id}')">

            Editar

        </button>


        <button
            class="table-action delete"
            onclick="deleteObject('${object.id}')">

            Eliminar

        </button>

    `;


    return `

        <tr>

            <td>
                ${escapeHTML(object.id)}
            </td>

            <td>
                <strong>
                    ${escapeHTML(object.name)}
                </strong>
            </td>

            <td>
                ${formatDate(object.date)}
            </td>

            <td>
                ${escapeHTML(object.place)}
            </td>

            <td>
                ${statusHTML(object.status)}
            </td>

            <td>
                ${actions}
            </td>

        </tr>

    `;

}


/* =====================================================
   OBJETOS
===================================================== */

function renderObjects() {

    const tbody =
        document.getElementById(
            "objectsTableBody"
        );


    if (!tbody) return;


    let list =
        [...objects];


    if (
        currentFilter !== "Todos"
    ) {

        list =
            list.filter(
                object =>
                    object.status ===
                    currentFilter
            );

    }


    if (
        list.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-message">

                    No hay objetos registrados.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        list
            .map(
                createTableRow
            )
            .join("");

}


/* =====================================================
   FILTROS
===================================================== */

function filterObjects(
    filter,
    button
) {

    currentFilter =
        filter;


    document
        .querySelectorAll(
            ".filter-button"
        )
        .forEach(
            item =>
                item.classList.remove(
                    "active"
                )
        );


    button.classList.add(
        "active"
    );


    renderObjects();

}


/* =====================================================
   BUSCAR
===================================================== */

function searchObjects() {

    const input =
        document.getElementById(
            "searchInput"
        );


    const status =
        document.getElementById(
            "searchStatus"
        );


    const tbody =
        document.getElementById(
            "searchTableBody"
        );


    if (
        !input ||
        !status ||
        !tbody
    ) return;


    const text =
        input.value
            .trim()
            .toLowerCase();


    const selected =
        status.value;


    const results =
        objects.filter(object => {

            const searchable = `

                ${object.name}
                ${object.place}
                ${object.description}
                ${object.student || ""}

            `.toLowerCase();


            const textMatch =
                searchable.includes(text);


            const statusMatch =
                selected === "Todos" ||
                object.status === selected;


            return (
                textMatch &&
                statusMatch
            );

        });


    if (
        results.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-message">

                    No se encontraron objetos.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        results
            .map(
                createTableRow
            )
            .join("");

}


/* =====================================================
   MARCAR ENCONTRADO
===================================================== */

function markFound(id) {

    const object =
        objects.find(
            item =>
                item.id === id
        );


    if (!object) return;


    object.status =
        "Encontrado";


    addHistory(
        object,
        "El objeto fue marcado como encontrado."
    );


    saveObjects();

    updateAll();


    showToast(
        `"${object.name}" fue marcado como encontrado.`,
        "success"
    );


    viewDetails(id);

}


/* =====================================================
   MARCAR RECUPERADO
===================================================== */

function markRecovered(id) {

    const object =
        objects.find(
            item =>
                item.id === id
        );


    if (!object) return;


    if (
        object.status !== "Encontrado"
    ) {

        showToast(
            "El objeto debe estar encontrado primero.",
            "error"
        );

        return;

    }


    const confirmation =
        confirm(
            `¿Confirmas que "${object.name}" fue entregado a su dueño?`
        );


    if (!confirmation)
        return;


    object.status =
        "Recuperado";


    addHistory(
        object,
        "El objeto fue entregado a su dueño."
    );


    saveObjects();

    updateAll();


    showToast(
        `"${object.name}" fue marcado como recuperado.`,
        "success"
    );


    viewDetails(id);

}


/* =====================================================
   DETALLES
===================================================== */

function viewDetails(id) {

    const object =
        objects.find(
            item =>
                item.id === id
        );


    if (!object) return;


    let image = `

        <div class="detail-placeholder">
            ◇
        </div>

    `;


    if (object.image) {

        image = `

            <img
                src="${object.image}"
                alt="Objeto">

        `;

    }


    let actions = "";


    if (
        object.status === "Perdido"
    ) {

        actions += `

            <button
                class="detail-button found"
                onclick="markFound('${id}')">

                Marcar encontrado

            </button>

        `;

    }


    if (
        object.status === "Encontrado"
    ) {

        actions += `

            <button
                class="detail-button recover"
                onclick="markRecovered('${id}')">

                Marcar recuperado

            </button>

        `;

    }


    actions += `

        <button
            class="detail-button edit"
            onclick="editObject('${id}')">

            Editar

        </button>


        <button
            class="detail-button delete"
            onclick="deleteObject('${id}')">

            Eliminar

        </button>


        <button
            class="detail-button back"
            onclick="openObjects()">

            Volver

        </button>

    `;


    const history =
        object.history || [];


    const historyHTML =
        history.length === 0

            ? "Sin historial."

            : history
                .map(
                    item => `

                        <div class="history-item">

                            ${escapeHTML(
                                item.date
                            )}

                            —
                            ${escapeHTML(
                                item.message
                            )}

                        </div>

                    `
                )
                .join("");


    document.getElementById(
        "detailContent"
    ).innerHTML = `

        <div class="detail-grid">

            <div>

                <div class="detail-image">

                    ${image}

                </div>

            </div>


            <div class="detail-info">

                <div class="detail-row">

                    <strong>ID</strong>

                    <span>
                        ${escapeHTML(object.id)}
                    </span>

                </div>


                <div class="detail-row">

                    <strong>Objeto</strong>

                    <span>
                        ${escapeHTML(object.name)}
                    </span>

                </div>


                <div class="detail-row">

                    <strong>Descripción</strong>

                    <span>
                        ${escapeHTML(object.description)}
                    </span>

                </div>


                <div class="detail-row">

                    <strong>Fecha</strong>

                    <span>
                        ${formatDate(object.date)}
                    </span>

                </div>


                <div class="detail-row">

                    <strong>Lugar</strong>

                    <span>
                        ${escapeHTML(object.place)}
                    </span>

                </div>


                <div class="detail-row">

                    <strong>Estudiante</strong>

                    <span>
                        ${escapeHTML(
                            object.student ||
                            "No especificado"
                        )}
                    </span>

                </div>


                <div class="detail-row">

                    <strong>Estado</strong>

                    <span>
                        ${statusHTML(object.status)}
                    </span>

                </div>

            </div>

        </div>


        <div class="detail-actions">

            ${actions}

        </div>


        <div class="history">

            <h3>
                Historial del registro
            </h3>

            ${historyHTML}

        </div>

    `;


    showScreen(
        "detailScreen"
    );

}


/* =====================================================
   EDITAR
===================================================== */

function editObject(id) {

    const object =
        objects.find(
            item =>
                item.id === id
        );


    if (!object) return;


    editingId =
        id;


    document.getElementById(
        "formTitle"
    ).textContent =
        "Editar objeto";


    document.getElementById(
        "objectType"
    ).value =
        object.status === "Recuperado"
            ? "Encontrado"
            : object.status;


    document.getElementById(
        "objectName"
    ).value =
        object.name;


    document.getElementById(
        "objectDescription"
    ).value =
        object.description;


    document.getElementById(
        "objectDate"
    ).value =
        object.date;


    document.getElementById(
        "objectPlace"
    ).value =
        object.place;


    document.getElementById(
        "studentName"
    ).value =
        object.student || "";


    currentImage =
        object.image || "";


    if (object.image) {

        const preview =
            document.getElementById(
                "imagePreview"
            );


        preview.innerHTML = `

            <img
                src="${object.image}"
                alt="Objeto">

        `;


        preview.classList.add(
            "visible"
        );

    }


    showScreen(
        "registerScreen"
    );

}


/* =====================================================
   ELIMINAR
===================================================== */

function deleteObject(id) {

    const object =
        objects.find(
            item =>
                item.id === id
        );


    if (!object) return;


    const confirmation =
        confirm(
            `¿Eliminar "${object.name}"?`
        );


    if (!confirmation)
        return;


    objects =
        objects.filter(
            item =>
                item.id !== id
        );


    saveObjects();

    updateAll();


    showToast(
        "Objeto eliminado.",
        "success"
    );


    openObjects();

}


/* =====================================================
   AVISOS
===================================================== */

function renderNotifications() {

    const container =
        document.getElementById(
            "notificationsContent"
        );


    if (!container) return;


    const found =
        objects.filter(
            object =>
                object.status === "Encontrado"
        );


    if (
        found.length === 0
    ) {

        container.innerHTML = `

            <div class="content-card">

                <div class="empty-message">

                    No hay objetos encontrados
                    pendientes de reclamar.

                </div>

            </div>

        `;

        return;

    }


    container.innerHTML =
        found
            .map(
                object => `

                    <div
                        class="notification-card">

                        <div
                            class="notification-icon">

                            ✓

                        </div>


                        <div>

                            <h3>
                                Objeto encontrado
                            </h3>


                            <p>

                                <strong>
                                    ${escapeHTML(
                                        object.name
                                    )}
                                </strong>

                                fue encontrado en

                                <strong>
                                    ${escapeHTML(
                                        object.place
                                    )}
                                </strong>.

                            </p>


                            <p>

                                Fecha:
                                ${formatDate(
                                    object.date
                                )}

                            </p>


                            <button
                                class="table-action"
                                onclick="viewDetails('${object.id}')">

                                Ver detalles

                            </button>


                            <button
                                class="table-action recover"
                                onclick="markRecovered('${object.id}')">

                                Marcar recuperado

                            </button>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message,
    type = ""
) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.className =
        `toast show ${type}`;


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* =====================================================
   SEGURIDAD
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}