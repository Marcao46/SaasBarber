import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "SUA_CHAVE",
  authDomain: "saasbarbe.firebaseapp.com",
  projectId: "saasbarbe",
  storageBucket: "saasbarbe.firebasestorage.app",
  messagingSenderId: "627465989896",
  appId: "1:627465989896:web:399dab3f1a1e668ca786bd",
  measurementId: "G-BPJLTJMCLJ"
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

export { db }