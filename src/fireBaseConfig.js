
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
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

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth(app)
const secondaryApp = getApps().some(
  (app) => app.name === "Secondary"
)
  ? getApp("Secondary")
  : initializeApp(firebaseConfig, "Secondary")

const secondaryAuth = getAuth(secondaryApp)

export { db, auth, secondaryAuth }