import { initializeApp } from "firebase/app";
import "firebase/auth"


const firebaseConfig = {
    apiKey: "AIzaSyADO_LVuYvLekJw7Mmuepd1RVO4-EnF94Y",
    authDomain: "collabdev-b911c.firebaseapp.com",
    projectId: "collabdev-b911c",
    storageBucket: "collabdev-b911c.firebasestorage.app",
    messagingSenderId: "176894846158",
    appId: "1:176894846158:web:96b4edacff78edfa8c9c9f"
  };

  // Initialize Firebase
const app = initializeApp(firebaseConfig);


export default  app;