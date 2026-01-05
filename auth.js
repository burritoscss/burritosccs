// auth.js
import { auth, db } from "./index.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Registro
export async function registrarUsuario(email, password, nombre, rol) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "Usuarios", cred.user.uid), {
    uid: cred.user.uid,
    email,
    nombre,
    rol
  });
}

// Login
export async function iniciarSesion(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "Usuarios", cred.user.uid));
  if (snap.exists()) {
    const rol = snap.data().rol;
    if (rol === "jefa") {
      window.location.href = "dashboard-jefa.html";
    } else {
      window.location.href = "dashboard-empleado.html";
    }
  }
}

