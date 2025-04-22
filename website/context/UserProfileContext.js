"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, database } from "@/config"; // adjust path if needed
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";

// 1. Create context
const UserProfileContext = createContext();

// 2. Provider component
export const UserProfileProvider = ({ children }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = ref(database, `users/${user.uid}`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setUserProfile({
                        uid: user.uid,
                        userName: userData.userName,
                        email: userData.Email || user.email,
                        githubId: userData.GitHubID || "",
                        profilePicture: userData.ProfilePicture || user.photoURL || null
                    });
                } else {
                    // Handle new user or fallback
                    setUserProfile({
                        uid: user.uid,
                        userName: user.email?.split("@")[0] ?? "",
                        email: user.email,
                        githubId: "",
                        profilePicture: user.photoURL || null
                    });
                }
            } else {
                setUserProfile(null); // Not logged in
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserProfileContext.Provider value={{ userProfile, setUserProfile, isLoading }}>
            {children}
        </UserProfileContext.Provider>
    );
};

// 3. Custom hook
export const useUserProfile = () => useContext(UserProfileContext);
