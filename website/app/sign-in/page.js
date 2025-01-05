"use client";
import Image from "next/image";
import app from "@/config";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useEffect, useState } from "react";

export default function SignIn() {
    const [user, setUser] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const auth = getAuth(app);
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null)
            }
        })

        return () => unsubscribe();
    }, [])

    const signInWithGoogle = async () => {
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider)
            router.push("/profile-info")
        } catch (error) {
            console.error("Error signing in with  Google", error.message)
        }
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
                    <p className="font-bold text-[#E2E2FE] text-[28px] mb-8">Sign Up</p>
                    <button className="w-[301px] h-[58px] bg-[#020222] rounded-[30px] border-[#E2E2FE] border-2 flex gap-3 p-2 items-center justify-center drop-shadow-xl" onClick={signInWithGoogle}>
                        <img src="/google.svg" alt="google" />
                        <p className="font-bold text-[#E2E2FE] text-[18px] " >Sign Up</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
