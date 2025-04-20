"use client"
import { useDialogs } from '@/context/DialogsContext';
import { useAuth } from '@/context/AuthContext';
import { useMatrix } from '@/context/matrixContext';
import React, { useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../config';
import { useRouter } from 'next/navigation';

const Metrixs = () => {
    const { toggleMetrixDialog } = useDialogs();
    const { user } = useAuth();
    const {
        currentMatrixId,
        setCurrentMatrixId,
        matrices,
        isLoading
    } = useMatrix();
    const router = useRouter();

    // Filter matrices to only show those the user has access to
    const userMatrices = matrices.filter(matrix =>
        matrix.users && matrix.users.includes(user?.uid)
    );

    const handleMatrixClick = (matrixId) => {
        setCurrentMatrixId(matrixId);

        // Find the matrix data
        const selectedMatrix = userMatrices.find(matrix => matrix.id === matrixId);

        // Handle navigation based on current page and matrix data
        if (window.location.pathname.includes('/track')) {
            if (selectedMatrix && selectedMatrix.track) {
                router.push(`/matrix/${matrixId}`);
            } else {
                router.push(`/matrix/${matrixId}`);
            }
        } else {
            router.push(`/matrix/${matrixId}`);
        }
    };

    const activeIndex = userMatrices.findIndex(matrix => matrix.id === currentMatrixId);
    const topOffset = 7.5 * 16 + (activeIndex !== -1 ? activeIndex * 80 : 0);

    return (
        <div className='w-[40%] border-[#020222] border-r-2 relative'>
            {/* Your existing JSX remains the same, just replace matrices with userMatrices */}
            <div className='h-[70px] mx-4 my-4 flex flex-col justify-center'>
                <div className='bg-[#020222] w-[57.92px] h-[57.92px] rounded-full flex justify-center items-center mx-auto'>
                    <img src="/Logo.svg" alt="Logo" />
                </div>
                <div className='border-[#020222] border-b-2 w-[50px] h-[2px] mt-3 mx-auto'></div>
            </div>

            <div className='my-8 flex flex-col gap-5'>
                {isLoading ? (
                    ""
                ) : (
                    <>
                        {userMatrices.length > 0 ? (
                            userMatrices.map((matrix) => (
                                <div
                                    key={matrix.id}
                                    className='flex flex-col items-center cursor-pointer'
                                    onClick={() => handleMatrixClick(matrix.id)}
                                >
                                    <div className='bg-[#020222] w-[59px] h-[59px] rounded-full flex justify-center items-center mx-auto'>
                                        {matrix.logo !== "" ? (
                                            <img
                                                src={matrix.logo}
                                                alt={matrix.name}
                                                className='w-10 h-10 object-contain'
                                            />
                                        ) : (
                                            <div className='text-white text-xl font-bold'>
                                                {matrix.name.split(' ').length > 1
                                                    ? matrix.name.split(' ')[0].charAt(0).toUpperCase() + matrix.name.split(' ')[1].charAt(0).toUpperCase()
                                                    : matrix.name.charAt(0).toUpperCase()
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            ""
                        )}

                        <div
                            className='bg-[#020222] w-[59px] h-[59px] rounded-full flex justify-center items-center mx-auto cursor-pointer'
                            onClick={toggleMetrixDialog}
                        >
                            <img src="/add.svg" alt="Add Matrix" />
                        </div>
                    </>
                )}
            </div>

            {activeIndex !== -1 ? (
                <div
                    className='absolute transition-all duration-300'
                    style={{ top: `${topOffset}px ` }}
                >
                    <img src="/active.svg" alt="Active" />
                </div>
            ) : (
                <div className='top-[7.5rem] absolute'>
                    <img src="/active.svg" alt="Active" />
                </div>
            )}
        </div>
    );
};

export default Metrixs;