"use client";

import { useEffect, useState, useRef } from "react";
import { use } from "react";
import {
  ref,
  get,
  set,
  onValue,
  off,
  push,
  onChildAdded,
  remove,
  update,
} from "firebase/database";
import { database } from "@/config";
import PresentUsers from "@/components/PresentUser";
import InteractionTools from "@/components/InteractionTools";
import { useRouter } from "next/navigation";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function EchoPage({ params }) {
  const { slug } = use(params);
  const [echoData, setEchoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState({});
  const [localParticipantId] = useState(
    `user-${Math.random().toString(36).substr(2, 9)}`
  );

  // Media state
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // WebRTC refs
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const peerConnection = useRef(null);
  const screenStream = useRef(null);
  const listeners = useRef([]);
  const originalVideoTrack = useRef(null);
  const hasCreatedOffer = useRef(false);

  const router = useRouter();

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Fetch echo data
        const echoRef = ref(database, `echoes/${slug}`);
        const echoSnap = await get(echoRef);
        if (!echoSnap.exists()) {
          throw new Error("Echo not found");
        }
        setEchoData(echoSnap.val());

        // Join as participant
        await joinAsParticipant(slug, localParticipantId);

        // Setup media
        await setupMedia();

        // Setup WebRTC
        await setupWebRTC(slug);

        // Setup listeners
        setupParticipantListener(slug);
      } catch (error) {
        console.error("Call initialization failed:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeCall();

    return () => {
      cleanupCall(slug, localParticipantId);
    };
  }, [slug, localParticipantId]);

  // Join as participant
  const joinAsParticipant = async (echoId, participantId) => {
    const participantRef = ref(
      database,
      `echoes/${echoId}/participants/${participantId}`
    );
    await set(participantRef, {
      id: participantId,
      joinedAt: new Date().toISOString(),
      active: true,
    });
  };

  // Cleanup call
  const cleanupCall = async (echoId, participantId) => {
    // Remove participant
    const participantRef = ref(
      database,
      `echoes/${echoId}/participants/${participantId}`
    );
    await remove(participantRef);

    // Then cleanup WebRTC and media
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Cleanup media streams
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    if (remoteStream.current) {
      remoteStream.current.getTracks().forEach((track) => track.stop());
      remoteStream.current = null;
    }

    if (screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop());
      screenStream.current = null;
    }

    // Remove listeners
    listeners.current.forEach((unsubscribe) => unsubscribe());
    listeners.current = [];
  };

  // Setup media devices
  const setupMedia = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  };

  // Setup WebRTC connection
  const setupWebRTC = async (echoId) => {
    // Cleanup any existing connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Create new peer connection
    createPeerConnection();

    // Check participants to decide offer/answer
    const participantsRef = ref(database, `echoes/${echoId}/participants`);
    const participantsSnap = await get(participantsRef);

    const currentParticipants = participantsSnap.exists()
      ? Object.keys(participantsSnap.val()).length
      : 0;

    // Only clear existing data if we're creating a new offer
    if (!participantsSnap.exists() || currentParticipants <= 1) {
      await Promise.all([
        set(ref(database, `echoes/${echoId}/offer`), null),
        set(ref(database, `echoes/${echoId}/answer`), null),
        set(ref(database, `echoes/${echoId}/offerCandidates`), null),
        set(ref(database, `echoes/${echoId}/answerCandidates`), null),
      ]);
      await createOffer(echoId);
      hasCreatedOffer.current = true;
    } else {
      // For answerers, don't clear existing offer - just create answer
      await createAnswer(echoId);
      hasCreatedOffer.current = false;
    }
  };

  // Create peer connection
  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(servers);
    remoteStream.current = new MediaStream();

    // Add local tracks
    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    // Handle remote tracks
    peerConnection.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.current.addTrack(track);
      });
    };

    // Handle connection state changes
    peerConnection.current.oniceconnectionstatechange = () => {
      console.log(
        "ICE connection state:",
        peerConnection.current.iceConnectionState
      );
      if (
        peerConnection.current.iceConnectionState === "failed" ||
        peerConnection.current.iceConnectionState === "disconnected"
      ) {
        console.log("Connection failed, attempting restart...");
        restartIce(echoId);
      }
    };
  };

  // Create offer
  const createOffer = async (echoId) => {
    console.log("Creating offer... 1", peerConnection.current);
    if (peerConnection.current === null) {
      console.log("Peer connection not initialized, creating new one...");

      console.error("Peer connection not initialized");
      return;
    }
    try {
      const offerCandidatesRef = ref(
        database,
        `echoes/${echoId}/offerCandidates`
      );
      const answerCandidatesRef = ref(
        database,
        `echoes/${echoId}/answerCandidates`
      );

      // Clear any existing candidates
      await remove(offerCandidatesRef);
      await remove(answerCandidatesRef);

      console.log("Creating offer...", peerConnection.current);

      // ICE candidate handler
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          push(offerCandidatesRef, event.candidate.toJSON());
        }
      };

      // Create offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      // Save offer to DB
      await set(ref(database, `echoes/${echoId}/offer`), {
        type: offer.type,
        sdp: offer.sdp,
      });

      // Listen for answer
      const answerRef = ref(database, `echoes/${echoId}/answer`);
      const answerListener = onValue(answerRef, async (snap) => {
        if (!snap.exists()) return;

        const answer = snap.val();
        try {
          // Only set if we don't already have a remote description
          if (!peerConnection.current.remoteDescription) {
            await peerConnection.current.setRemoteDescription(
              new RTCSessionDescription(answer)
            );
          }
        } catch (error) {
          console.error("Error setting remote description:", error);
        }
      });

      // Listen for answer candidates
      const answerCandidatesListener = onChildAdded(
        answerCandidatesRef,
        (snap) => {
          if (snap.exists()) {
            const candidate = new RTCIceCandidate(snap.val());
            peerConnection.current.addIceCandidate(candidate).catch((e) => {
              console.error("Error adding ICE candidate:", e);
            });
          }
        }
      );

      listeners.current.push(
        () => off(answerRef),
        () => off(answerCandidatesRef)
      );
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  };

  // Create answer
  const createAnswer = async (echoId) => {
    try {
      const offerRef = ref(database, `echoes/${echoId}/offer`);
      const offerCandidatesRef = ref(
        database,
        `echoes/${echoId}/offerCandidates`
      );
      const answerCandidatesRef = ref(
        database,
        `echoes/${echoId}/answerCandidates`
      );

      // Only clear answer candidates (not the offer)
      await remove(answerCandidatesRef);

      // ICE candidate handler
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          push(answerCandidatesRef, event.candidate.toJSON());
        }
      };

      // Get offer from DB - with retry logic
      let offerSnap;
      let retries = 3;
      while (retries > 0) {
        offerSnap = await get(offerRef);
        if (offerSnap.exists()) break;
        retries--;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (!offerSnap.exists()) {
        throw new Error("Offer not found after retries");
      }

      // Set remote description
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offerSnap.val())
      );

      // Create answer
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      // Save answer to DB
      await set(ref(database, `echoes/${echoId}/answer`), {
        type: answer.type,
        sdp: answer.sdp,
      });

      // Listen for offer candidates
      const offerCandidatesListener = onChildAdded(
        offerCandidatesRef,
        (snap) => {
          if (snap.exists()) {
            const candidate = new RTCIceCandidate(snap.val());
            peerConnection.current.addIceCandidate(candidate).catch((e) => {
              console.error("Error adding ICE candidate:", e);
            });
          }
        }
      );

      listeners.current.push(() => off(offerCandidatesRef));
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  };

  // Restart ICE
  const restartIce = async (echoId) => {
    console.log("Restarting ICE...");
    try {
      // Cleanup existing connection
      if (peerConnection.current) {
        peerConnection.current.close();
      }

      // Create new connection
      createPeerConnection();

      // Create new offer
      await createOffer(echoId);
    } catch (error) {
      console.error("Error restarting ICE:", error);
    }
  };

  // Listen for participant changes
  const setupParticipantListener = (echoId) => {
    const participantsRef = ref(database, `echoes/${echoId}/participants`);

    // Store previous participant count
    let previousParticipantCount = 0;

    const listener = onValue(participantsRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setParticipants({});
        return;
      }

      const currentParticipants = snapshot.val();
      const currentCount = Object.keys(currentParticipants).length;

      // Update participants state
      setParticipants(currentParticipants);

      // Check if someone left (count decreased)
      if (currentCount < previousParticipantCount) {
        console.log(
          `Participant left. Previous: ${previousParticipantCount}, Current: ${currentCount}`
        );

        // If we're the only one left or the initiator, create new offer
        if (currentCount === 1 || hasCreatedOffer.current) {
          console.log("Initiating renegotiation...");

          // Cleanup existing connection
          if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
          }

          // Create new connection and offer
          await setupWebRTC(echoId);
        }
      }

      // Update previous count
      previousParticipantCount = currentCount;
    });

    listeners.current.push(() => off(participantsRef));
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCameraOn(!isCameraOn);
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        // Get screen stream
        screenStream.current = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "monitor", // or "window", "browser"
            frameRate: { ideal: 30 },
          },
          audio: false, // Set to true if you want to share audio
        });

        // Get the video track from screen stream
        const screenTrack = screenStream.current.getVideoTracks()[0];

        // Store the original video track if not already stored
        const videoSender = peerConnection.current
          .getSenders()
          .find((sender) => sender.track?.kind === "video");

        if (videoSender && !originalVideoTrack.current) {
          originalVideoTrack.current = videoSender.track;
        }

        // Replace the track in the peer connection
        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        }

        // Update local display to show screen share
        if (localStream.current) {
          // Create new stream with screen track
          const newLocalStream = new MediaStream();
          localStream.current.getAudioTracks().forEach((track) => {
            newLocalStream.addTrack(track);
          });
          newLocalStream.addTrack(screenTrack);
          localStream.current = newLocalStream;
        }

        // Handle when user stops sharing via browser UI
        screenTrack.onended = () => {
          stopScreenSharing();
        };

        setIsScreenSharing(true);
        console.log("Screen sharing started");
      } catch (error) {
        console.error("Error starting screen share:", error);
        setIsScreenSharing(false);
      }
    } else {
      stopScreenSharing();
    }
  };

  // Stop screen sharing
  const stopScreenSharing = async () => {
    if (!screenStream.current) return;

    try {
      // Stop all tracks in the screen stream
      screenStream.current.getTracks().forEach((track) => track.stop());

      // Restore original video track if available
      const videoSender = peerConnection.current
        .getSenders()
        .find((sender) => sender.track?.kind === "video");

      if (videoSender && originalVideoTrack.current) {
        await videoSender.replaceTrack(originalVideoTrack.current);

        // Restore local display to show camera
        if (localStream.current) {
          const newLocalStream = new MediaStream();
          localStream.current.getAudioTracks().forEach((track) => {
            newLocalStream.addTrack(track);
          });
          if (originalVideoTrack.current) {
            newLocalStream.addTrack(originalVideoTrack.current);
          }
          localStream.current = newLocalStream;
        }

        originalVideoTrack.current = null;
      }

      setIsScreenSharing(false);
      screenStream.current = null;
      console.log("Screen sharing stopped");
    } catch (error) {
      console.error("Error stopping screen share:", error);
    }
  };

  const cutCall = async () => {
    await cleanupCall(slug, localParticipantId);
    router.push("/");
  };

  // Render loading/error states
  if (loading) {
    return <div className="w-full bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] relative overflow-hidden flex justify-center items-center">
      <p className="text-white text-[24px] font-bold whitespace-normal break-words max-w-lg mx-auto mt-4 text-center">
        <div role="status">
          <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      </p>
    </div>;
  }
  if (error) {
    return (
      <div className="w-full bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] relative overflow-hidden flex justify-center items-start">
        <div className="flex justify-center text-center flex-col items-center">
          <img src="/error.png" className="w-[300px]  h-[300px]  rounded-3xl mt-44" />
          <p className="text-white text-[24px] font-bold whitespace-normal break-words max-w-lg mx-auto mt-4 text-center">
            {error}
          </p>
        </div>
      </div>
    );
  }
  if (!echoData) {
    return <div className="w-full bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] relative overflow-hidden flex justify-center items-center">
      <p className="text-white text-[24px] font-bold whitespace-normal break-words max-w-lg mx-auto mt-4 text-center">
        No echo data found
      </p>
    </div>;
  }

  // Main render
  return (
    <div className="w-full bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] relative overflow-hidden">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <img src="/voiceIcon.svg" className="w-[28px] h-[28px]" />
          <p className="text-[#000000] text-[24px] font-medium">
            {/* Display the echo name from the fetched data */}
            {echoData.name || `Voice-ch-${slug}`}
          </p>
        </div>
        <div>
          <img src="/messager.svg" className="w-[30.63px] h-[30.63px]" />
        </div>
      </div>

      {/* Pass the echo data to child components if needed */}
      <PresentUsers
        localVideoRef={(el) =>
          el && localStream.current && (el.srcObject = localStream.current)
        }
        remoteVideoRef={(el) =>
          el && remoteStream.current && (el.srcObject = remoteStream.current)
        }
        userCount={Object.keys(participants).length}
      />
      <InteractionTools
        toggleScreenShare={toggleScreenShare}
        toggleMic={toggleMic}
        toggleCamera={toggleCamera}
        cutCall={cutCall}
        isCameraOn={isCameraOn}
        isMicOn={isMicOn}
        isScreenSharing={isScreenSharing}
      />
    </div>
  );
}
