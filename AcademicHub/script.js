
/* =========================================
   1. REFERENCIAS A ELEMENTOS DEL HTML
   ========================================= */

// Guardamos referencias a los elementos que utilizaremos.

const formulario = document.getElementById("formActividad");

const botonMostrar = document.getElementById(
    "btnMostrarFormulario"
);

const listaActividades = document.getElementById(
    "listaActividades"
);

const totalPendientes = document.getElementById(
    "totalPendientes"
);

const totalProximas = document.getElementById(
    "totalProximas"
);

const totalCompletadas = document.getElementById(
    "totalCompletadas"
);


/* =========================================
   2. FECHAS Y DATOS DE EJEMPLO
   ========================================= */

// Obtenemos la fecha local en formato YYYY-MM-DD.
// Evitamos depender de la zona horaria UTC.

function fechaLocal(fecha = new Date()) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

// Calcula una fecha futura o pasada a partir de hoy.

function fechaConDesfase(dias) {
    const fecha = new Date();
    fecha.setHours(12, 0, 0, 0);
    fecha.setDate(fecha.getDate() + dias);

    return fechaLocal(fecha);
}

// Actividades iniciales para mostrar cómo funciona el panel.
// Más adelante se pueden reemplazar por datos reales.

let actividades = [
    {
        id: 1,
        nombre: "Taller de programación",
        materia: "Desarrollo de software",
        fecha: fechaConDesfase(2),
        tipo: "Tarea",
        completada: false
    },
    {
        id: 2,
        nombre: "Exposición de redes",
        materia: "Telemática II",
        fecha: fechaConDesfase(5),
        tipo: "Exposición",
        completada: false
    },
    {
        id: 3,
        nombre: "Entrega del proyecto",
        materia: "Ingeniería de software",
        fecha: fechaConDesfase(10),
        tipo: "Proyecto",
        completada: false
    }
];

// Identificador que aumenta para cada nueva actividad.

let siguienteId = 4;


/* =========================================
   3. MOSTRAR Y OCULTAR EL FORMULARIO
   ========================================= */

// Al pulsar el botón se muestra o se oculta el formulario.

botonMostrar.addEventListener("click", () => {
    formulario.classList.toggle("hidden");

    // Cambiamos el texto del botón según el estado.

    const formularioOculto = formulario.classList.contains("hidden");

    botonMostrar.textContent = formularioOculto
        ? "+ Nueva actividad"
        : "Cerrar formulario";
});


/* =========================================
   4. FUNCIONES PARA LAS FECHAS
   ========================================= */

// Calcula cuántos días faltan para una entrega.

function diasRestantes(fechaEntrega) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const entrega = new Date(`${fechaEntrega}T00:00:00`);

    return Math.round(
        (entrega.getTime() - hoy.getTime()) / 86400000
    );
}

// Convierte YYYY-MM-DD en una fecha fácil de leer.

function formatearFecha(fecha) {
    const partes = fecha.split("-");

    const fechaLegible = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

    return fechaLegible.toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Evita interpretar los nombres ingresados como código HTML.

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caracter => {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteres[caracter];
    });
}


/* =========================================
   5. ACTUALIZAR LOS CONTADORES
   ========================================= */

function actualizarContadores() {

    // Contamos las actividades que todavía no están completas.

    const pendientes = actividades.filter(
        actividad => !actividad.completada
    ).length;

    // Contamos las actividades pendientes que vencen
    // entre hoy y los próximos siete días, inclusive.

    const proximas = actividades.filter(actividad => {
        const dias = diasRestantes(actividad.fecha);

        return (
            !actividad.completada &&
            dias >= 0 &&
            dias <= 7
        );
    }).length;

    // Contamos las actividades finalizadas.

    const completadas = actividades.filter(
        actividad => actividad.completada
    ).length;

    // Actualizamos los números visibles en el HTML.

    totalPendientes.textContent = pendientes;
    totalProximas.textContent = proximas;
    totalCompletadas.textContent = completadas;
}


/* =========================================
   6. MOSTRAR LAS ACTIVIDADES
   ========================================= */

function mostrarActividades() {

    // Limpiamos la lista antes de dibujarla nuevamente.

    listaActividades.innerHTML = "";

    // Si no existen actividades, mostramos un mensaje.

    if (actividades.length === 0) {
        listaActividades.innerHTML = `
            <div class="empty-message">
                No tienes actividades registradas.
                ¡Agrega tu primera actividad!
            </div>
        `;

        actualizarContadores();
        return;
    }

    // Ordenamos las actividades por fecha de entrega.
    // Las pendientes aparecen antes que las completadas.

    const ordenadas = [...actividades].sort((a, b) => {
        if (a.completada !== b.completada) {
            return Number(a.completada) - Number(b.completada);
        }

        return a.fecha.localeCompare(b.fecha);
    });

    // Recorremos cada actividad para crear su tarjeta.

    ordenadas.forEach(actividad => {

        const dias = diasRestantes(actividad.fecha);

        let textoFecha;

        if (actividad.completada) {
            textoFecha = "Actividad completada";
        } else if (dias < 0) {
            textoFecha = `Vencida hace ${Math.abs(dias)} día(s)`;
        } else if (dias === 0) {
            textoFecha = "¡Entrega hoy!";
        } else if (dias === 1) {
            textoFecha = "Falta 1 día";
        } else {
            textoFecha = `Faltan ${dias} días`;
        }

        // Preparamos los textos para mostrarlos de forma segura.

        const nombre = escaparHTML(actividad.nombre);
        const materia = escaparHTML(actividad.materia);
        const tipo = escaparHTML(actividad.tipo);
        const fecha = formatearFecha(actividad.fecha);

        const tarjeta = document.createElement("article");

        tarjeta.className = "activity-item";

        tarjeta.innerHTML = `
            <div class="activity-info">
                <h3>${nombre}</h3>

                <p>${materia} · ${tipo}</p>

                <p>Entrega: ${fecha}</p>

                <span class="activity-date">
                    ${textoFecha}
                </span>
            </div>

            <span class="activity-status ${
                actividad.completada ? "done" : ""
            }">
                ${actividad.completada ? "Completada" : "Pendiente"}
            </span>

            <div class="activity-actions">
                <button
                    type="button"
                    class="action-button"
                    data-accion="completar"
                    data-id="${actividad.id}"
                >
                    ${actividad.completada ? "Reabrir" : "Completar"}
                </button>

                <button
                    type="button"
                    class="action-button"
                    data-accion="eliminar"
                    data-id="${actividad.id}"
                >
                    Eliminar
                </button>
            </div>
        `;

        listaActividades.appendChild(tarjeta);
    });

    // Actualizamos los contadores después de dibujar la lista.

    actualizarContadores();
}


/* =========================================
   7. REGISTRAR UNA NUEVA ACTIVIDAD
   ========================================= */

// Escuchamos el envío del formulario.

formulario.addEventListener("submit", evento => {

    // Evita que el navegador recargue la página.

    evento.preventDefault();

    // Obtenemos los valores escritos por el estudiante.

    const nombre = document.getElementById(
        "nombreActividad"
    ).value.trim();

    const materia = document.getElementById(
        "materiaActividad"
    ).value.trim();

    const fecha = document.getElementById(
        "fechaActividad"
    ).value;

    const tipo = document.getElementById(
        "tipoActividad"
    ).value;

    // Verificamos que los campos principales tengan datos.

    if (!nombre || !materia || !fecha) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Creamos un nuevo objeto con la información ingresada.

    const nuevaActividad = {
        id: siguienteId++,
        nombre: nombre,
        materia: materia,
        fecha: fecha,
        tipo: tipo,
        completada: false
    };

    // Guardamos la actividad en el arreglo.

    actividades.push(nuevaActividad);

    // Limpiamos el formulario.

    formulario.reset();

    // Ocultamos el formulario y actualizamos el botón.

    formulario.classList.add("hidden");
    botonMostrar.textContent = "+ Nueva actividad";

    // Volvemos a dibujar la lista y los contadores.

    mostrarActividades();
});


/* =========================================
   8. COMPLETAR, REABRIR O ELIMINAR
   ========================================= */

// Detectamos los clics realizados dentro de la lista.

listaActividades.addEventListener("click", evento => {

    const boton = evento.target.closest("button[data-accion]");

    // Si el clic no fue en un botón de acción, no hacemos nada.

    if (!boton) {
        return;
    }

    const id = Number(boton.dataset.id);
    const accion = boton.dataset.accion;

    if (accion === "completar") {

        // Cambiamos el estado de la actividad seleccionada.

        actividades = actividades.map(actividad => {
            if (actividad.id === id) {
                return {
                    ...actividad,
                    completada: !actividad.completada
                };
            }

            return actividad;
        });

    } else if (accion === "eliminar") {

        // Solicitamos confirmación antes de eliminar.

        const confirmar = confirm(
            "¿Deseas eliminar esta actividad?"
        );

        if (!confirmar) {
            return;
        }

        // Conservamos todas las actividades excepto la elegida.

        actividades = actividades.filter(
            actividad => actividad.id !== id
        );
    }

    // Refrescamos la interfaz.

    mostrarActividades();
});


/* =========================================
   9. INICIAR LA PÁGINA
   ========================================= */

// Al abrir la página mostramos los datos de ejemplo.

mostrarActividades();