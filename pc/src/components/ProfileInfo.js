import React, { useEffect, useState } from "react";
import { auth, database } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";


const ProfileInfo = () => {
    const [preview, setPreview] = useState(null);
    const [email, setEmail] = useState("");
    const [githubId, setGithubId] = useState("");
    const [userId, setUserId] = useState("");
    const navigate = useNavigate();

    // Generate username from email
    const generateUsername = (email) => {
        if (!email) return "";
        const localPart = email.split("@")[0];
        const cleanUsername = localPart.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const randomNum = Math.floor(Math.random() * 900) + 100;
        return `${cleanUsername}${randomNum}`;
    };

    // Set initial state from authenticated user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                if (user.photoURL) setPreview(user.photoURL);
                if (user.email) {
                    setEmail(user.email);
                    setUserId(generateUsername(user.email));
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // Handle form input changes
    const handleInputChange = (setter) => (e) => setter(e.target.value);

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate fields
        if (!preview || !email || !githubId || !userId) {
            alert("Please fill all the fields.");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        // Prepare data for Firebase
        const userData = {
            userName: userId,
            Email: email,
            ProfilePicture: preview,
            GitHubID: githubId,
        };

        try {
            // Save data to Firebase
            const user = auth.currentUser;
            if (!user) throw new Error("User is not authenticated.");
            const userRef = ref(database, `users/${user.uid}`);
            await set(userRef, userData);
            alert("Profile saved successfully!");
            navigate("/")
        } catch (error) {
            console.error("Error saving profile data:", error);
            alert("An error occurred while saving the profile. Please try again.");
        }
    };
  return (
    <div className="flex justify-center items-center h-screen">
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-gray-800 p-10 rounded-md">
        <div className="flex justify-between gap-10 items-center">
            <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Profile picture
                </label>
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
                        className="flex flex-col items-center justify-center w-full h-32 bg-gray-900 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                        {preview !== null ? (
                            <img
                                src={preview}
                                alt="Profile preview"
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-4">
                                <p className="text-sm text-gray-400">Click to upload profile picture</p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        )}
                    </label>
                </div>
                {preview && (
                    <button
                        type="button"
                        className="text-sm text-gray-500 mt-1 cursor-pointer"
                        onClick={() => setPreview(null)}
                    >
                        Remove Profile picture
                    </button>
                )}
            </div>
            <div className="mt-10">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Your email
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                    placeholder="name@flowbite.com"
                    required readOnly
                />
            </div>
        </div>
        <div className="mb-5">
            <label htmlFor="githubid" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                GitHub ID
            </label>
            <input
                type="text"
                id="githubid"
                value={githubId}
                onChange={handleInputChange(setGithubId)}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="dev-example-123"
                required
            />
        </div>
        <div className="mb-5">
            <label htmlFor="userid" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Username
            </label>
            <input
                type="text"
                id="userid"
                value={userId}
                onChange={handleInputChange(setUserId)}
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                placeholder="username123"
                required
            />
        </div>
        <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full"
        >
            Finish
        </button>
    </form>
</div>
  )
}

export default ProfileInfo