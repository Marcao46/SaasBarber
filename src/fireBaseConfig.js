
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { initializeApp, getApp, getApps } from "firebase/app"

const firebaseConfig = {
  apiKey: "AIzaSyDooJPb9dQuKf9ybfXF3saZO8ncZFVO-DE",
  authDomain: "saasbarbe.firebaseapp.com",
  projectId: "saasbarbe",
  storageBucket: "saasbarbe.firebasestorage.app",
  messagingSenderId: "627465989896",
  appId: "1:627465989896:web:399dab3f1a1e668ca786bd",
  measurementId: "G-BPJLTJMCLJ"
}

const usarEmuladores = import.meta.env.VITE_FIREBASE_EMULATORS === "true"
if (usarEmuladores) firebaseConfig.projectId = "demo-saasbarber"
const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth(app)
const secondaryApp = getApps().some(
  (app) => app.name === "Secondary"
)
  ? getApp("Secondary")
  : initializeApp(firebaseConfig, "Secondary")

const secondaryAuth = getAuth(secondaryApp)
if (usarEmuladores) {
  connectFirestoreEmulator(db, "127.0.0.1", 8080)
  connectAuthEmulator(auth, "http://127.0.0.1:9099")
  connectAuthEmulator(secondaryAuth, "http://127.0.0.1:9099")
}

export { db, auth, secondaryAuth }
