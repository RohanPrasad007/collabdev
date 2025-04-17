"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ref, get, set, onValue } from "firebase/database";
import { database } from "@/config";
import { useAuth } from "@/context/AuthContext";

export default function JoinMatrix({ params }) {
  const { matrixId } = params;
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const matrixRef = ref(database, `matrices/${matrixId}`);
        const snapshot = await get(matrixRef);

        if (!snapshot.exists()) {
          setError("Matrix not found");
          return;
        }

        setMatrix(snapshot.val());
      } catch (err) {
        console.error("Error fetching matrix:", err);
        setError("Failed to load matrix");
      } finally {
        setLoading(false);
      }
    };

    fetchMatrix();
  }, [matrixId]);

  const handleJoinMatrix = async () => {
    if (!user || !matrix) return;
    setJoining(true);

    try {
      // Get current users array
      const matrixUsersRef = ref(database, `matrices/${matrixId}/users`);
      const snapshot = await get(matrixUsersRef);

      let currentUsers = [];
      if (snapshot.exists()) {
        currentUsers = snapshot.val();
      }

      // Add user if not already present
      if (!currentUsers.includes(user.uid)) {
        const updatedUsers = [...currentUsers, user.uid];
        await set(matrixUsersRef, updatedUsers);
      }

      router.push(`/matrix/${matrixId}`);
    } catch (err) {
      console.error("Error joining matrix:", err);
      setError("Failed to join matrix");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-700">Loading matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md mx-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{error}</h2>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Join {matrix.name || "Matrix"}
        </h1>
        <p className="text-gray-600 mb-6">
          You've been invited to join this matrix workspace
        </p>

        {user ? (
          <button
            onClick={handleJoinMatrix}
            disabled={joining}
            className={`w-full py-2 px-4 rounded-md text-white ${
              joining ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {joining ? "Joining..." : "Join Matrix"}
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              You need to sign in to join this matrix
            </p>
            <button
              onClick={() => router.push(`/login?redirect=/join/${matrixId}`)}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
