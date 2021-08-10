import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCmnFREla-J6mcLOYzr9yxJvuK_a3drsUk",
  authDomain: "twitter-app-96b73.firebaseapp.com",
  projectId: "twitter-app-96b73",
  storageBucket: "twitter-app-96b73.appspot.com",
  messagingSenderId: "808595097289",
  appId: "1:808595097289:web:2a7d75414c009740ef2f18",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

export const db = firebaseApp.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
export const provider = new firebase.auth.GoogleAuthProvider();
