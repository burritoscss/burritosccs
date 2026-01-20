import { db } from "./index.js";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

let calendar;
let turnoActivo = null;
let miNombreGlobal = "";

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar calendario con tu configuración original
    calendar = new FullCalendar.Calendar(document.getElementById('calendario'), {
        initialView: 'timeGridWeek',
        locale: 'es',
        allDaySlot: false,
        slotMinTime: '08:00:00',
        buttonText: { today: 'Hoy', week: 'Semana', day: 'Día', prev: 'Ant', next: 'Sig' }
    });
    calendar.render();

    cargarDatosEmpleado();
    
    // Intervalo de 1 segundo para actualizar el botón de entrada
    setInterval(actualizarEstadoBoton, 1000);

    // Eventos de botones
    document.getElementById("btnMarcar").addEventListener("click", marcarEntrada);
    document.getElementById("btnCerrarSesion").addEventListener("click", () => {
        localStorage.removeItem("cedula");
        window.location.href = "login.html";
    });
});

async function cargarDatosEmpleado() {
    const cedula = localStorage.getItem("cedula");
    if(!cedula) { window.location.href = "login.html"; return; }

    const q = query(collection(db, "Usuarios"), where("cedula", "==", cedula));
    const userSnap = await getDocs(q);
    
    if(userSnap.empty) return;
    
    const userDoc = userSnap.docs[0];
    const uid = userDoc.id;
    miNombreGlobal = userDoc.data().nombre;
    
    document.getElementById("nombreEmpleado").innerText = "Empleado: " + miNombreGlobal;
    document.getElementById("saludoEntrada").innerText = "¡HOLA, " + miNombreGlobal.split(' ')[0].toUpperCase() + "!";

    // Cargar horarios
    const hQ = query(collection(db, "Horarios"), where("empleadoId", "==", uid));
    const hSnap = await getDocs(hQ);
    const listaHTML = document.getElementById("listaTurnos");
    listaHTML.innerHTML = "";
    
    let turnos = [];
    hSnap.forEach(doc => { turnos.push({ id: doc.id, ...doc.data() }); });

    // Ordenar turnos cronológicamente (Tu lógica original)
    turnos.sort((a, b) => new Date(`${a.dia}T${a.horaInicio}`) - new Date(`${b.dia}T${b.horaInicio}`));

    turnos.forEach(h => {
        listaHTML.insertAdjacentHTML("beforeend", `
            <tr>
                <td>${h.dia}</td>
                <td>${h.horaInicio.substring(0,5)}</td>
                <td>${h.horaFin.substring(0,5)}</td>
            </tr>
        `);

        calendar.addEvent({
            title: `${miNombreGlobal}\n${h.horaInicio.substring(0,5)} - ${h.horaFin.substring(0,5)}`,
            start: `${h.dia}T${h.horaInicio}`,
            end: `${h.dia}T${h.horaFin}`,
            // Tus colores originales por estado
            backgroundColor: h.estado === "Pendiente" ? "#3498db" : (h.estado === "Falta" ? "#e74c3c" : (h.estado === "Retraso" ? "#f1c40f" : "#2ecc71")),
            borderColor: "#000"
        });
    });

    // Detectar si hay un turno para hoy/ahora
    const ahora = new Date();
    turnoActivo = turnos.find(t => {
        const hEntrada = new Date(`${t.dia}T${t.horaInicio}`);
        const limite = new Date(hEntrada.getTime() + 60 * 60000); 
        return t.estado === "Pendiente" && ahora < limite;
    });

    if (turnoActivo) {
        document.getElementById("checkInArea").style.display = "block";
        document.getElementById("infoTurno").innerText = `Turno programado: ${turnoActivo.dia} a las ${turnoActivo.horaInicio.substring(0,5)}`;
    }
}

function actualizarEstadoBoton() {
    if (!turnoActivo) return;

    const ahora = new Date();
    const hEntrada = new Date(`${turnoActivo.dia}T${turnoActivo.horaInicio}`);
    const finGracia = new Date(hEntrada.getTime() + 15 * 60000); 
    const btn = document.getElementById("btnMarcar");

    if (ahora < hEntrada) {
        btn.disabled = true;
        btn.innerText = "BLOQUEADO (TEMPRANO)";
        btn.style.background = "#444"; btn.style.color = "white";
    } else if (ahora >= hEntrada && ahora <= finGracia) {
        btn.disabled = false;
        btn.innerText = "MARCAR ENTRADA";
        btn.style.background = "#2ecc71"; btn.style.color = "white";
    } else {
        btn.disabled = true;
        btn.innerText = "BLOQUEADO (TARDE)";
        btn.style.background = "#e74c3c"; btn.style.color = "white";
    }
}

async function marcarEntrada() {
    try {
        const ref = doc(db, "Horarios", turnoActivo.id);
        await updateDoc(ref, { 
            estado: "Normal",
            horaRealEntrada: new Date().toLocaleTimeString() 
        });
        alert("✅ Entrada registrada correctamente.");
        location.reload();
    } catch (e) { alert("Error: " + e.message); }
}
