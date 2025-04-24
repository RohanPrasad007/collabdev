import app from "../firebase";
import { getAuth } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from "firebase/auth";
import { useEffect, useState } from "react";

export default function SignIn() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Replace with your actual user check (Firestore, etc.)
        const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
        navigate(isNewUser ? '/profile-info' : '/home');
      }
    });
    setIsLoading(false)
    return () => unsubscribe();

  }, []);


  const signInWithGoogleHandler = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Try popup first
      try {
        const result = await signInWithPopup(auth, provider);
        if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
          navigate("/profile-info");
        } else {
          navigate("/");
        }
      } catch (popupError) {
        // If popup fails, fall back to redirect
        console.log("Popup failed, falling back to redirect...");
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };


  if (isLoading) {
    return (
      <div className="h-screen bg-[#020222] flex justify-center items-center">
        <p className="text-[#E2E2FE]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020222] flex justify-center items-center relative">
      <div className="bg-[#E2E2FE] w-[756px] h-[422px] opacity-[25%] rounded-[8px]" />
      <div className="bg-[#848DF9] w-[700px] h-[371px] rounded-[8px] absolute flex items-center justify-center shadow-md shadow-[#63636c]">
        <div>
          <img src="/bgLeft.svg" className="absolute left-0 top-0" />
          <img src="/bgRight.svg" className="absolute right-0 top-0" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8">
            <img src="/Logo.svg" alt="Logo" />
          </div>
          <p className="font-bold text-[#E2E2FE] text-[28px] mb-8 font-[ZenDots]">CollabDev</p>
          <button
            className="w-[301px] h-[58px] bg-[#020222] rounded-[30px] border-[#E2E2FE] border-2 flex gap-3 p-2 items-center justify-center drop-shadow-xl"
            onClick={signInWithGoogleHandler}
          >
            <img src="/google.svg" alt="google" />
            <p className="font-bold text-[#E2E2FE] text-[18px]">Continue with Google</p>
          </button>
        </div>
      </div>
    </div>
  );
}