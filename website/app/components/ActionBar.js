"use client"
import React, { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'

const ActionBar = () => {
    const auth = getAuth()
    const router = useRouter();
    const [user, setUser] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
            } else {
                router.push("/sign-in")
            }
        })
        return () => unsubscribe();
    }, [auth, router])

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/sign-in")
        } catch (error) {
            console.error("Error siging out :", error.message)
        }
    }
    return (
        <div className=' absolute w-[100%] h-[20%] bottom-0  mx-auto p-2 '>
            <div className='bg-white h-full w-full rounded-lg  text-black px-4 py-2 text-xl cursor-pointer' onClick={handleLogout}>
                Logout
            </div>
        </div>
    )
}

export default ActionBar