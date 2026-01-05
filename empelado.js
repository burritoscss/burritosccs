// empleado.js
import { auth, db } from "./index.js";
import { collection, query, where, getDocs } from "firebase/firestore";

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const horariosQ = query(collection(db, "Horarios"), where("empleadoUid", "==", user.uid));
    const advQ = query(collection(db, "Advertencias"), where("empleadoUid", "==", user.uid));

    const horariosSnap = await getDocs(horariosQ);
    let horariosHTML = "<ul>";
    horariosSnap.forEach(doc => {
      const h = doc.data();
      horariosHTML += `<li>${h.dia}: ${h.horaInicio} - ${h.horaFin}</li>`;
    });
    horariosHTML += "</ul>";
    document.getElementById("horarios").innerHTML = horariosHTML;

    const advSnap = await getDocs(advQ);
    let advHTML = "<ul>";
    advSnap.forEach(doc => {
      const a = doc.data();
      advHTML += `<li>${a.fecha} - ${a.tipo}: ${a.mensaje}</li>`;
    });
    advHTML += "</ul>";
    document.getElementById("advertencias").innerHTML = advHTML;
  }
});
