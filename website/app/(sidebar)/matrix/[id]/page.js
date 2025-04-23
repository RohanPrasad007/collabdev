"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ref, get } from "firebase/database";
import { database } from "@/config";
import { useAuth } from "@/context/AuthContext";

const Page = () => {
  const [matrixData, setMatrixData] = useState(null);
  const [trackId, setTrackId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("Hello");
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();

  const id = params.id;

  // Get current time for greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Fetch matrix data
  useEffect(() => {
    const fetchMatrixData = async () => {
      try {
        const matrixRef = ref(database, `matrices/${id}`);
        const snapshot = await get(matrixRef);

        if (!snapshot.exists()) {
          throw new Error("Matrix not found");
        }

        const data = snapshot.val();
        setMatrixData(data);

        setTrackId(data.track || "");
      } catch (err) {
        console.error("Error fetching matrix:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatrixData();
  }, [id]);

  const handleGoToTrack = () => {
    if (trackId) {
      router.push(`/track/${trackId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#848DF9] to-[#6E079E]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#848DF9] to-[#6E079E]">
        <div className="text-white text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#848DF9] to-[#6E079E]">
      <div className="flex flex-col items-center justify-center flex-1 w-full px-4 text-center text-white">
        <h1 className="text-4xl font-bold mb-2">
          {greeting}, {user?.displayName || "User"}{" "}
          <span className="inline-block animate-pulse">👋</span>
        </h1>
        <p className="text-xl mb-8">
          {matrixData?.name
            ? `Welcome to ${matrixData.name}`
            : "Let's get started on something awesome."}
        </p>
        {trackId && (
          <button
            onClick={handleGoToTrack}
            className="px-6 py-3 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-colors duration-300 text-lg"
          >
            Go to Track
          </button>
        )}
      </div>
    </div>
  );
};

export default Page;
