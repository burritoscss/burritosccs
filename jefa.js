// Configuración Firebase (igual que en login)
const firebaseConfig = {
  apiKey: "AIzaSyAf5Ht4BrFzvhOmVdIduTPIlcspth9GAHs",
  authDomain: "horarios-burritos.firebaseapp.com",
  projectId: "horarios-burritos",
  storageBucket: "horarios-burritos.appspot.com",
  messagingSenderId: "275317724774",
  appId: "1:275317724774:web:95324e52dce0ff7ab73fa7",
  measurementId: "G-7QC4JF0BGJ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Cargar empleados en los selects
async function cargarEmpleados() {
  const snapshot = await db.collection("Usuarios").get();
  const selectHorario = document.getElementById("empleadoSelect");
  const selectAdv = document.getElementById("advSelect");

  selectHorario.innerHTML = "";
  selectAdv.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.rol === "empleado") {
      const option1 = document.createElement("option");
      option1.value = data.uid;
      option1.textContent = data.nombre;
      selectHorario.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = data.uid;
      option2.textContent = data.nombre;
      selectAdv.appendChild(option2);
    }
  });
}

// Asignar horario
document.getElementById("btnHorario").addEventListener("click", async () => {
  const empleadoUid = document.getElementById("empleadoSelect").value;
  const dia = document.getElementById("dia").value;
  const inicio = document.getElementById("horaInicio").value;
  const fin = document.getElementById("horaFin").value;

  await db.collection("Horarios").add({
    empleadoUid,
    dia,
    horaInicio: inicio,
    horaFin: fin
  });
  alert("Horario asignado");
});

// Emitir advertencia
document.getElementById("btnAdv").addEventListener("click", async () => {
  const empleadoUid = document.getElementById("advSelect").value;
  const fecha = document.getElementById("fecha").value;
  const tipo = document.getElementById("tipo").value;
  const mensaje = document.getElementById("mensaje").value;

  await db.collection("Advertencias").add({
    empleadoUid,
    fecha,
    tipo,
    mensaje
  });
  alert("Advertencia enviada");
});

// Balance de horas
async function calcularBalanceHoras() {
  const snapshot = await db.collection("Horarios").get();
  const horasPorEmpleado = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    const inicio = parseInt(data.horaInicio.split(":")[0]);
    const fin = parseInt(data.horaFin.split(":")[0]);
    const horas = fin - inicio;

    if (!horasPorEmpleado[data.empleadoUid]) {
      horasPorEmpleado[data.empleadoUid] = 0;
    }
    horasPorEmpleado[data.empleadoUid] += horas;
  });

  let html = "<ul>";
  for (const uid in horasPorEmpleado) {
    html += `<li>${uid}: ${horasPorEmpleado[uid]} horas</li>`;
  }
  html += "</ul>";
  document.getElementById("balanceHoras").innerHTML = html;
}

// Inicializar
cargarEmpleados();
calcularBalanceHoras();
