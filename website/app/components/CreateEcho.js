import { useDialogs } from '@/context/DialogsContext';
import React, { useState } from 'react';
import { createNewEcho } from '../services/databaseService';
import { useAuth } from '@/context/AuthContext';
import { useMatrix } from '../../context/matrixContext';

const CreateEcho = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('All');
    const [echoName, setEchoName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toggleEchoDialog } = useDialogs();
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

    const handleCreateEcho = async () => {
        // Validate input
        if (!echoName.trim()) {
            setError('Please enter an echo name');
            return;
        }

        if (!user) {
            setError('You must be logged in to create an echo');
            return;
        }

        if (!currentMatrixId) {
            setError('No matrix selected. Please select a matrix first.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Create the echo object with all required fields
            const echoData = {
                name: echoName.trim(),
                access_level: selectedOption,
                created_by: user.uid,
                active_participants: [], // Initialize empty participants array
                status: 'active', // or 'pending' based on your requirements
                offer_details: '', // Initialize empty
                answer_details: '' // Initialize empty
            };

            // Create echo and associate with matrix
            const createdEcho = await createNewEcho(echoData, currentMatrixId);

            console.log('Echo created successfully:', createdEcho);
            toggleEchoDialog();

        } catch (error) {
            console.error('Error creating echo:', error);
            setError('Failed to create echo. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='absolute top-0 w-full h-[98vh] bg-black/70 flex justify-center items-center'>
            <div className='w-[615px] h-[400px] bg-[#020222] border-[1px] border-[#848DF9] drop-shadow-2xl rounded-[12px] p-[24px] relative'>
                <div className='flex justify-between items-center'>
                    <div className='font-medium text-[24px] text-[#E2E2FE]'>
                        Create Echo
                    </div>
                    <div>
                        <img
                            src='/close-toggle.svg'
                            onClick={toggleEchoDialog}
                            className='cursor-pointer'
                            alt="Close"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-4 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <div className='mt-[36px] flex flex-col gap-[22px]'>
                    <div>
                        <div className='font-bold text-[14px] text-[#E2E2FE] mb-2'>ECHO NAME</div>
                        <div className='w-[544px] h-[50px] bg-[#0A0A3A] border-[1px] border-[#848DF9] px-[9px] outline-none rounded-[8px] flex items-center gap-2'>
                            <img src='/Thread-icon.svg' alt="Thread" />
                            <input
                                className='w-full h-full bg-[#0A0A3A] outline-none rounded-[8px] placeholder:text-[#E2E2FE]/70 text-[14px]'
                                placeholder='new-echo-name'
                                value={echoName}
                                onChange={(e) => setEchoName(e.target.value)}
                            />
                        </div>
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
                        className={`w-[100px] h-[40px] bg-[#848DF9] drop-shadow-md rounded-[8px] flex justify-center items-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={handleCreateEcho}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateEcho;