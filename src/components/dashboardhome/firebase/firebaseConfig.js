import { initializeApp} from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, collection, addDoc, setDoc, doc } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfgXt4R0deZkfKDtAqDcCVvHiLF1kvddY",
  authDomain: "dyci-academix.firebaseapp.com",
  projectId: "dyci-academix",
  storageBucket: "dyci-academix.appspot.com",
  messagingSenderId: "428153341934",
  appId: "1:428153341934:web:dedfa2fdbe98944764f0ff",
  measurementId: "G-GQE4J7T10V"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);


// Export the services and functions
export { auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, db, collection, addDoc, setDoc, doc, sendEmailVerification, sendPasswordResetEmail };
