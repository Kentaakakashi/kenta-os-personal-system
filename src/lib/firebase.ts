// Firebase core
import { initializeApp } from "firebase/app";

// Firebase services we actually need
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your config (using what you sent)
const firebaseConfig = {
  apiKey: "AIzaSyCEthECHBhYBdIWmbaAQMJDyIUxn20TWiQ",
  authDomain: "pooka-os.firebaseapp.com",
  projectId: "pooka-os",
  storageBucket: "pooka-os.firebasestorage.app",
  messagingSenderId: "304292975845",
  appId: "1:304292975845:web:d1441057dfb5a706bbb00c",
  measurementId: "G-8V6H5JXB4Q"
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Export auth + db
export const auth = getAuth(app);
export const db = getFirestore(app);
