"use client";
import React, { useEffect, useState } from "react";
import { use } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/config";
import { useAuth } from "@/context/AuthContext";
import Thread from "@/components/Thread";

function page({ params }) {
  const { id } = use(params);
  const [threadData, setThreadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchThreadData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const threadRef = ref(database, `threads/${id}`);
        const threadSnapshot = await get(threadRef);

        if (threadSnapshot.exists()) {
          setThreadData({
            id: threadSnapshot.key,
            ...threadSnapshot.val(),
          });
        } else {
          setError("Thread not found");
        }
      } catch (error) {
        console.error("Error fetching thread:", error);
        setError("Failed to load thread");
      } finally {
        setLoading(false);
      }
    };

    fetchThreadData();
  }, [id]);

  console.log("threadData", threadData);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-[#848DF9] w-full rounded-[8px] h-[98vh]">
        <span classNames="loader"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#848DF9]">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[98vh]  w-full ">
      <div className="flex-1 flex flex-col h-[98vh] overflow-hidden">
        <div className="flex-1 overflow-hidden rounded-[8px]">
          <Thread threadId={id} userId={user?.uid} threadData={threadData} />
        </div>
      </div>
    </div>
  );
}

export default page;
