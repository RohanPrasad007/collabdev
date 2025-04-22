"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { useMatrix } from '@/context/matrixContext';
import { getMatrixById, createNewTrack, updateMatrixTrack } from '../services/databaseService';
import { useAuth } from '@/context/AuthContext';

const Track = () => {
    const router = useRouter();
    const { currentMatrixId } = useMatrix();
    const { user } = useAuth();

    const handleClick = async () => {
        if (!currentMatrixId) {
            alert("Please select a matrix first");
            return;
        }

        try {
            // Get current matrix data
            const matrix = await getMatrixById(currentMatrixId);

            if (!matrix) {
                console.error("Matrix not found");
                return;
            }

            if (matrix.track) {
                // If matrix has a track, navigate to it
                router.push(`/track/${matrix.track}`);
            } else {
                // Create a new track, then navigate
                const newTrack = await createNewTrack({
                    name: "Main Track",
                    created_by: user?.uid || null
                });
                await updateMatrixTrack(currentMatrixId, newTrack.track_id);
                router.push(`/track/${newTrack.track_id}`);
            }
        } catch (error) {
            console.error("Error handling track navigation:", error);
        }
    };

    return (
        <div
            className='flex items-center gap-2 cursor-pointer'
            onClick={handleClick}
        >
            <div>
                <img src='/track.svg' alt="Track" />
            </div>
            <div className='text-[24px] text-[#000000] font-medium'>
                Track
            </div>
        </div>
    );
};

export default Track;