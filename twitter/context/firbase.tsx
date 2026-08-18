import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGnTsp6HGoA_xILvaOgy_CI1LpNwqGElM",
  authDomain: "twiller-88474.firebaseapp.com",
  projectId: "twiller-88474",
  storageBucket: "twiller-88474.firebasestorage.app",
  messagingSenderId: "941122837205",
  appId: "1:941122837205:web:9d4f5981abb382e1d5605c"
};


const app = initializeApp(firebaseConfig);
export const auth= getAuth(app)
export default app