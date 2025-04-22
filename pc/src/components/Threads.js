"use client"
import { useDialogs } from '../context/DialogsContext';
import { useMatrix } from '../context/matrixContext';
import { useThread } from '../context/ThreadContext';
import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Threads = () => {
    const { toggleThreadDialog } = useDialogs();
    const { currentMatrixId } = useMatrix();
    const { currentThreadId, setCurrentThreadId } = useThread();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggleDropdown, setToggleDropdown] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentMatrixId) {
            setLoading(false);
            setThreads([]);
            return;
        }

        // Reference to threads for the current matrix
        const threadsRef = ref(database, `matrices/${currentMatrixId}/threads`);

        const unsubscribe = onValue(threadsRef, (snapshot) => {
            if (snapshot.exists()) {
                const threadsData = snapshot.val();
                // Convert thread IDs to an array
                const threadIds = Object.values(threadsData);

                // Create an array to store thread details
                const threadDetails = [];

                // Create a counter to track loaded threads
                let loadedCount = 0;
                const totalThreads = threadIds.length;

                if (totalThreads === 0) {
                    setThreads([]);
                    setLoading(false);
                    return;
                }

                // Fetch each thread's details using its ID
                threadIds.forEach((threadId) => {
                    const threadDetailRef = ref(database, `threads/${threadId}`);

                    onValue(threadDetailRef, (threadSnapshot) => {
                        if (threadSnapshot.exists()) {
                            const threadData = threadSnapshot.val();
                            threadDetails.push({
                                id: threadId,
                                ...threadData
                            });
                        }

                        loadedCount++;

                        // When all threads are loaded, update state
                        if (loadedCount === totalThreads) {
                            setThreads(threadDetails);
                            setLoading(false);

                            // Set the first thread as active if none is selected
                            if (threadDetails.length > 0 && !currentThreadId) {
                                setCurrentThreadId(threadDetails[0].id);
                            }
                        }
                    }, {
                        onlyOnce: true
                    });
                });
            } else {
                setThreads([]);
                setLoading(false);
            }
        }, (error) => {
            console.error('Error fetching threads:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentMatrixId, currentThreadId, setCurrentThreadId]);

    const handleThreadClick = (threadId) => {
        // Update the current thread in context
        setCurrentThreadId(threadId);

        // Log to console
        console.log("Selected thread ID:", threadId);

        // Navigate to the thread-specific URL
        navigate(`/thread/${threadId}`);
    };

    const handleDropdown = () => {
        setToggleDropdown(!toggleDropdown)
    }
    return (
        <div>
            <div className='h-[60px] border-[#020222] border-b-2 flex justify-start gap-2 items-end px-2 py-1 mt-[40px]'>
                <div className='flex items-center gap-8'>
                    <div className='mt-[10px] cursor-pointer'>
                        <img src='/dropdown.svg' onClick={handleDropdown} />
                    </div>
                    <div className='text-[24px] text-[#000000] font-medium'>
                        Threads
                    </div>
                    <div>
                        <img src='/plus.svg' onClick={toggleThreadDialog} className='cursor-pointer' />
                    </div>
                </div>
            </div>
            {!toggleDropdown ? (
                ""
            ) : (
                <div className='flex items-end justify-center py-1 mt-[15px]'>
                    <div className='flex flex-col gap-2'>
                        {threads.map((thread) => (
                            <div
                                key={thread.id}
                                className='flex items-center gap-3 cursor-pointer'
                                onClick={() => handleThreadClick(thread.id)}
                            >
                                <div>
                                    <img src='/textIcon.svg' />
                                </div>
                                <div className='text-[20px] text-[#000000] font-medium'>
                                    {thread.name || `Thread ${thread.id.substring(0, 8)}`}
                                </div>
                                {currentThreadId === thread.id && (
                                    <div>
                                        <img src='/activeText.svg' alt="Active" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Threads;