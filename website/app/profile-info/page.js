"use client";
import React, { useEffect, useState } from "react";
import { auth, database } from "../../config";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';

const ProfileInfo = () => {
    const [preview, setPreview] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [email, setEmail] = useState("");
    const [githubId, setGithubId] = useState("");
    const [userId, setUserId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [hasCustomImage, setHasCustomImage] = useState(false);
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    const generateUsername = (email) => {
        if (!email) return "";
        const localPart = email.split("@")[0];
        const cleanUsername = localPart.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const randomNum = Math.floor(Math.random() * 900) + 100;
        return `${cleanUsername}${randomNum}`;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (user.email) {
                    setEmail(user.email);
                    setUserId(generateUsername(user.email));
                }

                // Check if user has existing profile data
                const userRef = ref(database, `users/${user.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setEmail(userData.Email || user.email);
                    setUserId(userData.userName || generateUsername(user.email));
                    setGithubId(userData.GitHubID || "");
                    setPreview(userData.ProfilePicture || null);
                    setHasCustomImage(!!userData.ProfilePicture);
                } else if (user.photoURL && !hasCustomImage) {
                    // Only set Google profile picture for new users
                    setPreview(user.photoURL);
                }
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleInputChange = (setter) => (e) => setter(e.target.value);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) {
                toast.error("File size should be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setImageError(false);
                setHasCustomImage(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!preview || !email || !githubId || !userId) {
            toast.error("Please fill all the fields.");
            return;
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }
    
        try {
            setIsLoading(true);
            const user = auth.currentUser;
            if (!user) throw new Error("User is not authenticated.");
    
            // Store full image data in Realtime Database
            const userData = {
                userName: userId,
                Email: email,
                ProfilePicture: preview,
                GitHubID: githubId,
                hasCustomImage: true,
                lastUpdated: new Date().toISOString()
            };
    
            // Update Realtime Database first
            const userRef = ref(database, `users/${user.uid}`);
            await set(userRef, userData);
    
            // Use a generic photoURL for Authentication to avoid size limitations
            try {
                await updateProfile(user, {
                    photoURL: "/default-profile.png" // Use a placeholder or default image URL
                });
            } catch (authError) {
                console.warn("Failed to update Authentication profile picture, but database update succeeded:", authError);
                // Continue execution since the main functionality (database update) succeeded
            }
    
            // Show toast and wait for it to complete
            await new Promise((resolve) => {
                toast.success("Profile saved successfully!", {
                    onClose: () => resolve()
                });
            });
    
            // Redirect after toast is closed
            router.push("/");
        } catch (error) {
            console.error("Error saving profile data:", error);
            toast("An error occurred while saving the profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Rest of the component remains the same
    return (
        <>
            <div className="h-screen bg-[#020222] flex justify-center items-center relative">
                <div className="bg-[#E2E2FE] w-[756px] h-[422px] opacity-[25%] rounded-[8px]" />
                <div className="bg-[#848DF9] w-[700px] h-[371px] rounded-[8px] absolute shadow-md shadow-[#63636c]">
                    <div className="flex">
                        <div className="w-[35%] border-r-[1px] border-[#FFFFFF] h-[370px] flex justify-center items-center gap-4 flex-col">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="profile-upload"
                                />
                                <label
                                    htmlFor="profile-upload"
                                    className="flex flex-col items-center justify-center w-[150px] h-[9rem] bg-gray-900 cursor-pointer hover:bg-gray-800 transition-colors rounded-full"
                                >
                                    {preview && !imageError ? (
                                        <img
                                            src={preview}
                                            alt="Profile preview"
                                            className="w-full h-full object-cover rounded-full"
                                            onError={() => {
                                                setImageError(true);
                                                console.error("Image failed to load");
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full">
                                            <span className="text-gray-500">No Image</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                            <label htmlFor="profile-upload" className="cursor-pointer">
                                <div className="flex gap-2 items-center">
                                    <img src="/edit-icon.svg" alt="Edit profile" />
                                    <p className="text-[#000000] text-[14px]">Profile picture</p>
                                </div>
                            </label>
                        </div>
                        <div className="px-10 py-8 flex flex-col gap-5">
                            <div className="flex flex-col gap-1">
                                <p className="text-[#000000] text-[18px]">Your email</p>
                                <input
                                    className="bg-[#D9D9D9] w-[416px] h-[38px] rounded-[8px] focus:outline-[#000000] text-black px-7"
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={handleInputChange(setEmail)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[#000000] text-[18px]">Username</p>
                                <input
                                    className="bg-[#D9D9D9] w-[416px] h-[38px] rounded-[8px] focus:outline-[#000000] text-black px-7"
                                    type="text"
                                    id="userid"
                                    value={userId}
                                    onChange={handleInputChange(setUserId)}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[#000000] text-[18px]">GitHub ID</p>
                                <input
                                    className="bg-[#D9D9D9] w-[416px] h-[38px] rounded-[8px] focus:outline-[#000000] text-black px-7"
                                    type="text"
                                    id="githubid"
                                    value={githubId}
                                    onChange={handleInputChange(setGithubId)}
                                />
                            </div>
                            <div className="w-full flex justify-center my-2">
                                <div
                                    className="bg-[#020222] w-[225px] h-[46px] rounded-[12px] flex justify-center items-center border-2 border-[#C0C3E3]"
                                    onClick={handleSubmit}
                                >
                                    <button className="text-[#848DF9]" disabled={isLoading}>
                                        {isLoading ? "Saving..." : "Finish"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default ProfileInfo;