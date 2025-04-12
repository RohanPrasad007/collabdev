import { useDialogs } from '@/context/DialogsContext';
import React, { useState } from 'react';
import { createNewThread } from '../services/databaseService';
import { useAuth } from '@/context/AuthContext';
// Import your way of getting the current matrix
import { useMatrix } from '../../context/matrixContext'; // Option B


const CreateThread = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('All');
    const [threadName, setThreadName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toggleThreadDialog } = useDialogs();
    const { user } = useAuth();

    const { currentMatrixId } = useMatrix();

    const options = [
        'All',
        'Admin Only',
        'Members Only',
        'Custom'
    ];

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    // CreateThread.js
    const handleCreateThread = async () => {
        // Validate input
        if (!threadName.trim()) {
            setError('Please enter a thread name');
            return;
        }

        if (!user) {
            setError('You must be logged in to create a thread');
            return;
        }

        if (!currentMatrixId) {
            setError('No matrix selected. Please select a matrix first.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Create the thread object with all required fields
            const threadData = {
                name: threadName.trim(),
                access_level: selectedOption,
                created_by: user.uid, // Add the creator's user ID
                messages: [], // Initialize empty messages array
                files: [] // Initialize empty files array
            };

            // Create thread and associate with matrix
            const createdThread = await createNewThread(threadData, currentMatrixId);

            console.log('Thread created successfully:', createdThread);
            toggleThreadDialog();

        } catch (error) {
            console.error('Error creating thread:', error);
            setError('Failed to create thread. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='absolute top-0 w-full h-[98vh] bg-black/70 flex justify-center items-center'>
            <div className='w-[615px] h-[400px] bg-[#020222] border-[1px] border-[#848DF9] drop-shadow-2xl rounded-[12px] 
    p-[24px]  relative'>
                <div className='flex justify-between items-center'>
                    <div className='font-medium  text-[24px] text-[#E2E2FE]'>
                        Create Thread
                    </div>
                    <div>
                        <img src='/close-toggle.svg' onClick={toggleThreadDialog} className='cursor-pointer' alt="Close" />
                    </div>
                </div>
                <div className='mt-[36px] flex flex-col gap-[22px]'>
                    <div>
                        <div className='font-bold text-[14px] text-[#E2E2FE] mb-2'>THREAD NAME</div>
                        <div className='w-[544px] h-[50px] bg-[#0A0A3A] border-[1px] border-[#848DF9] px-[9px] outline-none rounded-[8px] flex items-center gap-2'>
                            <img src='/Thread-icon.svg' alt="Thread icon" />
                            <input
                                className='w-full h-full bg-[#0A0A3A] outline-none rounded-[8px] placeholder:text-[#E2E2FE]/70 text-[14px] text-[#E2E2FE]'
                                placeholder='new-thread-name'
                                value={threadName}
                                onChange={(e) => setThreadName(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className='text-start text-[12px] font-medium text-red-500 mt-1'>
                                {error}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className='font-medium text-[16px] text-[#E2E2FE] mb-2'>Allow to:</div>
                        <div className="relative w-[544px] h-[50px]">
                            <div
                                className="w-full h-full bg-[#0A0A3A] border-[1px] border-[#848DF9] px-[12px] outline-none rounded-[8px] flex items-center justify-between cursor-pointer"
                                onClick={toggleDropdown}
                            >
                                <span className="text-white">
                                    {selectedOption}
                                </span>
                                <img src='/dropdown-icon.svg' alt="Dropdown" />
                            </div>

                            {isOpen && (
                                <ul className="absolute top-full left-0 w-full bg-[#0A0A3A] border-[1px] border-[#848DF9] rounded-[8px] mt-1 max-h-[200px] overflow-y-auto z-10">
                                    {options.map((option, index) => (
                                        <li
                                            key={index}
                                            className="px-[9px] py-2 hover:bg-[#848DF9]/20 text-white cursor-pointer"
                                            onClick={() => handleOptionSelect(option)}
                                        >
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex justify-end items-end absolute right-[34px] bottom-[28px]'>
                    <button
                        className={`w-[100px] h-[40px] ${isLoading ? 'bg-[#848DF9]/50' : 'bg-[#848DF9]'} drop-shadow-md rounded-[8px] flex justify-center items-center text-[#E2E2FE] cursor-pointer`}
                        onClick={handleCreateThread}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateThread;