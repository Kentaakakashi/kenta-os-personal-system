import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEthECHBhYBdIWmbaAQMJDyIUxn20TWiQ",
  authDomain: "pooka-os.firebaseapp.com",
  projectId: "pooka-os",
  storageBucket: "pooka-os.firebasestorage.app",
  messagingSenderId: "304292975845",
  appId: "1:304292975845:web:d1441057dfb5a706bbb00c",
  measurementId: "G-8V6H5JXB4Q",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
