"use client"
import React, { useEffect, useRef } from "react";
import EmptyVoiceInvite from "./EmptyVoiceInvite";

const PresentUsers = ({ userCount = 1, localVideoRef, remoteVideoRef }) => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  // Handle ref updates
  useEffect(() => {
    if (localVideoRef) localVideoRef(localVideo.current);
  }, [localVideoRef]);

  useEffect(() => {
    if (remoteVideoRef) remoteVideoRef(remoteVideo.current);
  }, [remoteVideoRef]);

  return (
    <div className="flex flex-col justify-center items-center min-h-[80%] p-4">
      <div
        className={`
          ${
            userCount > 2
              ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 w-full max-w-6xl gap-8 "
              : "flex flex-col gap-8 w-[500px]"
          }
        `}
      >
        {[...Array(userCount)].map((_, index) => (
          <div
            key={index}
            className={`
              bg-[#020222] 
              w-full 
              h-[325px] 
              rounded-[40px] 
              flex 
              justify-center 
              items-center 
              relative
              ${index !== 0 ? "border-[3px] border-[#E433F5]" : ""}
            `}
          >
            <video
              ref={index === 0 ? localVideo : remoteVideo}
              autoPlay
              playsInline
              muted={index === 0}
              className="rounded-[40px] h-full w-full object-cover"
              onStalled={(e) => {
                // Handle video stall
                e.target.load();
              }}
            />
            <div className="absolute bottom-0">
              <p className="text-[#E2E2FE] text-[20px] font-medium mb-2">
                {index === 0 ? "You" : `User ${index}`}
              </p>
            </div>
          </div>
        ))}
      </div>
      {userCount <= 1 && <EmptyVoiceInvite />}
    </div>
  );
};

export default PresentUsers;
