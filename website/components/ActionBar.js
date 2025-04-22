"use client"
import React, { useEffect, useState, useRef } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'

const ActionBar = () => {
    const auth = getAuth()
    const router = useRouter();
    const [user, setUser] = useState(null)
    const [showTooltip, setShowTooltip] = useState(false)
    const tooltipRef = useRef(null)

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

    useEffect(() => {
        // Handle clicks outside of the tooltip to close it
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setShowTooltip(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/sign-in")
        } catch (error) {
            console.error("Error signing out:", error.message)
        }
    }

    const toggleTooltip = () => {
        setShowTooltip(!showTooltip)
    }

    return (
        <div className="absolute bottom-0 left-3 mx-auto p-2" ref={tooltipRef}>
            <div onClick={toggleTooltip} className="cursor-pointer">
                <img src='settings.svg' alt="Settings" />
            </div>
            {showTooltip && (
                <div
                    className="absolute bottom-12 left-0 z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg 
                    shadow-md cursor-pointer"
                    onClick={handleLogout}
                >
                    Logout
                </div>
            )}
        </div>
    )
}

export default ActionBar