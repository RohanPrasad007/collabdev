// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyADO_LVuYvLekJw7Mmuepd1RVO4-EnF94Y",
  authDomain: "collabdev-b911c.firebaseapp.com",
  projectId: "collabdev-b911c",
  storageBucket: "rohan-prasad-portfolio.appspot.com",
  messagingSenderId: "176894846158",
  appId: "1:176894846158:web:96b4edacff78edfa8c9c9f",
  databaseURL: "https://collabdev-b911c-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app, "gs://rohan-prasad-portfolio.appspot.com");

// Export the app as the default export
export default app;

// Export the services you need as named exports
export { auth, database, storage };
