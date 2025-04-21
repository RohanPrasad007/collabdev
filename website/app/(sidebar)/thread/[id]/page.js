"use client";
import React, { useEffect, useState, useRef } from "react";
import { use } from "react";
import {
  ref,
  get,
  push,
  onValue,
  off,
  serverTimestamp,
  getDatabase,
  set,
} from "firebase/database";
import { database, storage } from "@/config";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import Avatar from "/components/Avatar";
import { useAuth } from "@/context/AuthContext";

// Encryption Utilities
const generateKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};

const exportKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey("jwk", key);
  return JSON.stringify(exported);
};

const importKey = async (keyStr) => {
  const keyData = JSON.parse(keyStr);
  return await window.crypto.subtle.importKey(
    "jwk",
    keyData,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
};

const encryptMessage = async (text, key) => {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  return {
    iv: Array.from(iv).join(","),
    ciphertext: Array.from(new Uint8Array(encrypted)).join(","),
  };
};

const decryptMessage = async (encryptedData, key) => {
  const iv = new Uint8Array(encryptedData.iv.split(",").map(Number));
  const ciphertext = new Uint8Array(
    encryptedData.ciphertext.split(",").map(Number)
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
};

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
        <span class="loader"></span>
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

const Thread = ({ threadId, userId, threadData }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [isKeyLoaded, setIsKeyLoaded] = useState(false);
  const [userDataMap, setUserDataMap] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Initialize or load encryption key from Firebase
  useEffect(() => {
    const initEncryption = async () => {
      try {
        const keyRef = ref(database, `threads/${threadId}/encryptionKey`);
        const keySnapshot = await get(keyRef);

        if (keySnapshot.exists()) {
          const key = await importKey(keySnapshot.val());
          setEncryptionKey(key);
        } else {
          // Generate new key for this thread
          const key = await generateKey();
          const exportedKey = await exportKey(key);

          // Store the key with the thread (accessible to all members)
          await set(keyRef, exportedKey);
          setEncryptionKey(key);
        }

        setIsKeyLoaded(true);
      } catch (error) {
        console.error("Encryption initialization failed:", error);
        setIsKeyLoaded(true); // Continue without encryption
      }
    };

    initEncryption();
  }, [threadId]);

  // Modified message fetching with proper iteration
  useEffect(() => {
    if (!threadId || !isKeyLoaded) return;

    const messagesRef = ref(database, `threads/${threadId}/messages`);
    const unsubscribe = onValue(messagesRef, async (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = [];
        const messagesObj = snapshot.val();

        // Process all messages
        for (const key of Object.keys(messagesObj)) {
          const message = {
            id: key,
            ...messagesObj[key],
          };

          // Handle both encrypted and unencrypted messages
          if (message.encrypted && encryptionKey) {
            try {
              message.content = await decryptMessage(
                message.content,
                encryptionKey
              );
              message.isDecrypted = true;
            } catch (error) {
              console.error("Decryption failed:", error);
              // Fallback to original content if decryption fails
              message.isDecrypted = false;
              message.content = "[Encrypted message]";
            }
          } else if (message.encrypted && !encryptionKey) {
            // No key available but message is encrypted
            message.content = "[Encrypted message - key not available]";
            message.isDecrypted = false;
          }

          messagesData.push(message);
        }

        // Sort by timestamp
        messagesData.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesData);
      } else {
        setMessages([]);
      }
    });

    return () => {
      off(messagesRef);
    };
  }, [threadId, isKeyLoaded, encryptionKey]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendFile = async (file) => {
    if (!file || !threadId || !user?.uid) return null;

    try {
      setIsUploading(true);

      const fileExtension = file.name.split(".").pop();
      const fileName = `${threadId}/${user.uid}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExtension}`;
      const fileRef = storageRef(storage, `files/${fileName}`);

      const uploadTask = uploadBytesResumable(fileRef, file);

      const fileData = await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload error: ", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              fileId: fileName,
              url: downloadURL,
              name: file.name,
              type: file.type,
              size: file.size,
              timestamp: new Date().toISOString(),
            });
          }
        );
      });

      return fileData;
    } catch (error) {
      console.error("File upload error: ", error);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedFilesList = [];

    for (let i = 0; i < files.length; i++) {
      const uploadedFile = await sendFile(files[i]);
      if (uploadedFile) {
        uploadedFilesList.push(uploadedFile);
      }
    }

    setUploadedFiles([...uploadedFiles, ...uploadedFilesList]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && uploadedFiles.length === 0) return;
    if (!isKeyLoaded) {
      console.error("Encryption not ready");
      return;
    }

    try {
      let contentToSend = newMessage.trim();
      let isEncrypted = false;

      // Encrypt if we have a key
      if (encryptionKey && contentToSend) {
        const encryptedContent = await encryptMessage(
          contentToSend,
          encryptionKey
        );
        contentToSend = encryptedContent;
        isEncrypted = true;
      }

      const messageData = {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userAvatar: user.photoURL || "",
        content: contentToSend,
        encrypted: isEncrypted,
        files: uploadedFiles,
        timestamp: serverTimestamp(),
      };

      await push(ref(database, `threads/${threadId}/messages`), messageData);

      setNewMessage("");
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  const removeUploadedFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("image")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
      );
    } else if (fileType.includes("video")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    let date;
    if (typeof timestamp === "object" && timestamp.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    } else {
      return "";
    }

    const now = new Date();
    const diff = now - date;

    if (diff < 86400000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diff < 604800000) {
      return (
        date.toLocaleDateString([], { weekday: "short" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      return date.toLocaleDateString();
    }
  };
  const getUserData = async (userId) => {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {
        userName: "Unknown User",
        profilePicture: "/default-profile.png",
      };
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const newUserDataMap = { ...userDataMap };

      // Only fetch data for users we don't already have
      for (const message of messages) {
        if (!newUserDataMap[message.userId]) {
          const userData = await getUserData(message.userId);
          newUserDataMap[message.userId] = userData;
        }
      }

      setUserDataMap(newUserDataMap);
    };

    loadUserData();
  }, [messages]);

  console.log("messages", messages);
  return (
    <div className="flex flex-col h-full bg-[#848DF9] rounded-[8px]">
      {/* Header */}
      <div className="bg-[#848DF9]  border-b border-[#020222] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <h2 className="text-[24px] font-semibold text-[#000000]">
            {threadData.name}
          </h2>
          <span className="text-xs px-2 py-1 bg-[#181836] text-[#848DF9] rounded-full border-[#848DF9] border-[1px]">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const userData = userDataMap[message.userId] || {
            userName: message.userName,
            profilePicture: message.userAvatar,
          };

          console.log("userData", userData);
          return (
            <div
              key={message.id}
              className={`flex ${
                message.userId === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.userId === userId ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar
                  src={userData.ProfilePicture} // Use fetched profile pic or fallback
                  name={userData.userName} // Use fetched username or fallback
                  className={`h-8 w-8 rounded-full flex-shrink-0 ${
                    message.userId === userId ? "ml-2" : "mr-2"
                  }`}
                />

                <div>
                  <div
                    className={`flex items-center ${
                      message.userId === userId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <span className="text-xs text-[#333333] mx-2">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    <span className="font-medium text-md text-[#000000]">
                      {userData.userName}
                    </span>
                  </div>

                  <div
                    className={`mt-1 p-3 rounded-lg ${
                      message.userId === userId
                        ? "bg-[#5A5FB7] text-white rounded-tr-none"
                        : "bg-[#5A5FB7] text-white  rounded-tl-none"
                    }`}
                  >
                    {message.content && (
                      <>
                        {message.encrypted && !message.isDecrypted ? (
                          <div className="text-sm italic text-white">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 inline mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Encrypted message (decryption failed)
                          </div>
                        ) : (
                          <p
                            className={`text-sm text-white
                            }`}
                          >
                            {message.content}
                          </p>
                        )}
                      </>
                    )}
                    {message.files && message.files.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.files.map((file, index) => (
                          <a
                            key={index}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center p-2 rounded ${
                              message.userId === userId
                                ? "bg-[#848DF9] hover:bg-[#848DF9]/70"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {getFileIcon(file.type)}
                            <div className="ml-2 flex-1 truncate">
                              <p
                                className={`text-xs font-medium ${
                                  message.userId === userId
                                    ? "text-white"
                                    : "text-gray-700"
                                }`}
                              >
                                {file.name}
                              </p>
                              <p
                                className={`text-xs ${
                                  message.userId === userId
                                    ? "text-blue-200"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* File Preview Area */}
      {uploadedFiles.length > 0 && (
        <div className="bg-[#020222] p-2 border-t border-[#848DF9]">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center bg-white rounded-lg border border-gray-200 p-2 shadow-sm"
              >
                {getFileIcon(file.type)}
                <span className="ml-2 text-sm text-gray-700 max-w-[150px] truncate">
                  {file.name}
                </span>
                <button
                  onClick={() => removeUploadedFile(index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-[#020222] p-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#848DF9] h-2 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-center mt-2 text-[#E2E2FE]">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-[#848DF9] p-3 border-t border-[#020222]">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
              />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-2 px-5 border border-[#848DF9] rounded-full focus:outline-none  focus:border-transparent text-[#E2E2FE] bg-[#181836]"
            />
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() && uploadedFiles.length === 0}
            className={`p-2 rounded-full ${
              !newMessage.trim() && uploadedFiles.length === 0
                ? "text-gray-400 bg-gray-100"
                : "text-white bg-[#E433F5] hover:bg-[#E433F5]/70"
            } focus:outline-none`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default page;
