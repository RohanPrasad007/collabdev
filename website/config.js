// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import Firebase Authentication
import { getDatabase } from 'firebase/database'; // Import Firebase Realtime Database

const firebaseConfig = {
  apiKey: 'AIzaSyADO_LVuYvLekJw7Mmuepd1RVO4-EnF94Y',
  authDomain: 'collabdev-b911c.firebaseapp.com',
  projectId: 'collabdev-b911c',
  storageBucket: 'collabdev-b911c.firebasestorage.app',
  messagingSenderId: '176894846158',
  appId: '1:176894846158:web:96b4edacff78edfa8c9c9f',
  databaseURL: 'https://collabdev-b911c-default-rtdb.firebaseio.com/', // Add your Realtime Database URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Initialize Authentication
const database = getDatabase(app); // Initialize Realtime Database

// Export the app as the default export
export default app;

// Export the services you need as named exports
export { auth, database };