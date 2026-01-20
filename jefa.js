import { db } from "./index.js";
import { collection, getDocs, addDoc } from "firebase/firestore";

// Cargar empleados en los selects
async function cargarEmpleados() {
  try {
    const snapshot = await getDocs(collection(db, "Usuarios"));
    const selectHorario = document.getElementById("empleadoSelect");
    const selectAdv = document.getElementById("advSelect");

    selectHorario.innerHTML = "";
    selectAdv.innerHTML = "";

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.rol === "empleado") {
        const option = document.createElement("option");
        option.value = data.uid || doc.id;
        option.textContent = data.nombre;
        
        selectHorario.appendChild(option.cloneNode(true));
        selectAdv.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error cargando empleados:", error);
  }
}

// Asignar horario
document.getElementById("btnHorario")?.addEventListener("click", async () => {
  const empleadoUid = document.getElementById("empleadoSelect").value;
  const dia = document.getElementById("dia").value;
  const inicio = document.getElementById("horaInicio").value;
  const fin = document.getElementById("horaFin").value;

  try {
    await addDoc(collection(db, "Horarios"), {
      empleadoUid,
      dia,
      horaInicio: inicio,
      horaFin: fin,
      estado: "Pendiente"
    });
    alert("✅ Horario asignado correctamente");
  } catch (error) {
    alert("Error al asignar: " + error.message);
  }
});

// Inicializar
cargarEmpleados();
