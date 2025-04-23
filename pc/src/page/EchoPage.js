import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { database } from "../firebase";
import PresentUsers from "../components/PresentUser";
import InteractionTools from "../components/InteractionTools";
const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const EchoPage = () => {
  const { echoId } = useParams(); // Get echoId from URL params
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

  const navigate = useNavigate(); // Replaces Next.js router

  console.log("this is echoId", echoId);
  console.log("this is localParticipantId", localParticipantId);

  // Initialize call
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Fetch echo data
        const echoRef = ref(database, `echoes/${echoId}`);
        const echoSnap = await get(echoRef);
        if (!echoSnap.exists()) {
          throw new Error("Echo not found");
        }
        setEchoData(echoSnap.val());

        // Join as participant
        await joinAsParticipant(echoId, localParticipantId);

        // Setup media
        await setupMedia();

        // Setup WebRTC
        await setupWebRTC(echoId);

        // Setup listeners
        setupParticipantListener(echoId);
      } catch (error) {
        console.error("Call initialization failed:", error);

        // Cleanup any created data
        await cleanupWebRTCData(echoId);

        setError({
          message: error.message,
          retry: () => {
            window.location.reload(); // Simple page reload
          },
        });
      } finally {
        setLoading(false);
      }
    };

    initializeCall();

    return () => {
      cleanupCall(echoId, localParticipantId);
    };
  }, [echoId, localParticipantId]);

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
        const sources = await window.electronAPI.getScreenSources();
        if (!sources || sources.length === 0) {
          throw new Error("No screen sources available");
        }

        const source = await window.electronAPI.showScreenPicker(sources);
        if (!source) {
          throw new Error("User canceled screen selection");
        }

        const constraints = {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: source.id,
              minWidth: 1280,
              maxWidth: 1920,
              minHeight: 720,
              maxHeight: 1080,
              minFrameRate: 30,
            },
          },
        };

        screenStream.current = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        // Handle track replacement
        const screenTrack = screenStream.current.getVideoTracks()[0];
        if (!screenTrack) throw new Error("No video track in screen stream");

        const videoSender = peerConnection.current
          .getSenders()
          .find((sender) => sender.track?.kind === "video");

        if (videoSender) {
          if (!originalVideoTrack.current) {
            originalVideoTrack.current = videoSender.track;
          }
          await videoSender.replaceTrack(screenTrack);
        }

        // Update local stream
        if (localStream.current) {
          const newLocalStream = new MediaStream([
            ...localStream.current.getAudioTracks(),
            screenTrack,
          ]);
          localStream.current = newLocalStream;
        }

        // Handle when sharing stops
        screenTrack.onended = () => {
          stopScreenSharing();
        };

        setIsScreenSharing(true);
        console.log("Screen sharing started successfully");
      } catch (error) {
        console.error("Screen sharing failed:", error);
        setIsScreenSharing(false);
        // Show error to user if needed
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
    await cleanupCall(echoId, localParticipantId);
    navigate("/");
  };

  const cleanupWebRTCData = async (echoId) => {
    try {
      await Promise.all([
        set(ref(database, `echoes/${echoId}/offer`), null),
        set(ref(database, `echoes/${echoId}/answer`), null),
        set(ref(database, `echoes/${echoId}/offerCandidates`), null),
        set(ref(database, `echoes/${echoId}/answerCandidates`), null),
        set(ref(database, `echoes/${echoId}/participants`), null),
      ]);
    } catch (error) {
      console.error("Error cleaning up WebRTC data:", error);
    }
  };

  // Render loading/error states
  if (loading) {
    return (
      <div className="w-full bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] relative overflow-hidden flex justify-center items-center">
        <span className="loader"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] relative overflow-hidden flex justify-center items-start">
        <div className="flex justify-center text-center flex-col items-center">
          <img
            src="/error.png"
            className="w-[300px] h-[300px] rounded-3xl mt-44"
            alt="Error"
          />
          <p className="text-white text-[24px] font-bold whitespace-normal break-words max-w-lg mx-auto mt-4 text-center">
            {error.message}
          </p>
          <button
            onClick={error.retry}
            className="mt-6 px-6 py-3 bg-[#E433F5] text-white rounded-full hover:bg-[#E433F5]/80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!echoData) {
    return (
      <div className="w-full bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] relative overflow-hidden flex justify-center items-center">
        <p className="text-white text-[24px] font-bold whitespace-normal break-words max-w-lg mx-auto mt-4 text-center">
          No echo data found
        </p>
      </div>
    );
  }

  // Main render
  return (
    <div className="w-full bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] relative overflow-hidden">
      <div className="flex justify-between">
        <div className="flex gap-2 items-center">
          <img
            src="/voiceIcon.svg"
            className="w-[28px] h-[28px]"
            alt="Voice Icon"
          />
          <p className="text-[#000000] text-[24px] font-medium">
            {echoData.name || `Voice-ch-${echoId}`}
          </p>
        </div>
      </div>

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
};

export default EchoPage;
