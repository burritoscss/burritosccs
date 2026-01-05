// index.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase (usa la que te dio la consola)
const firebaseConfig = {
  apiKey: "AIzaSyAf5Ht4BrFzvhOmVdIduTPIlcspth9GAHs",
  authDomain: "horarios-burritos.firebaseapp.com",
  projectId: "horarios-burritos",
  storageBucket: "horarios-burritos.appspot.com", // corregido
  messagingSenderId: "275317724774",
  appId: "1:275317724774:web:95324e52dce0ff7ab73fa7",
  measurementId: "G-7QC4JF0BGJ"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta servicios que usarás en otros archivos
export const auth = getAuth(app);
export const db = getFirestore(app);
