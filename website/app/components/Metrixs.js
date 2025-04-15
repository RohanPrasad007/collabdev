import { useDialogs } from '@/context/DialogsContext';
import { useAuth } from '@/context/AuthContext';
import { useMatrix } from '@/context/matrixContext';
import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config';
import { useRouter } from 'next/navigation';

const Metrixs = () => {
    const { toggleMetrixDialog } = useDialogs();
    const { user } = useAuth();
    const { currentMatrixId, setCurrentMatrixId } = useMatrix();
    const [matrices, setMatrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const matricesRef = ref(database, 'matrices');
        const unsubscribe = onValue(matricesRef, (snapshot) => {
            if (snapshot.exists()) {
                const matricesData = snapshot.val();
                const userMatrices = Object.entries(matricesData)
                    .filter(([_, matrix]) => matrix.users && matrix.users.includes(user.uid))
                    .map(([id, data]) => ({
                        id,
                        ...data
                    }));

                setMatrices(userMatrices);
            } else {
                setMatrices([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching matrices:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleMatrixClick = (matrixId) => {
        // First update the current matrix
        setCurrentMatrixId(matrixId);

        // Find the matrix data
        const selectedMatrix = matrices.find(matrix => matrix.id === matrixId);

        // Handle navigation based on current page and matrix data
        if (window.location.pathname.includes('/track')) {
            if (selectedMatrix && selectedMatrix.track) {
                // If on track page and matrix has track, navigate to that track
                router.push(`/track?id=${selectedMatrix.track}`);
            } else {
                // If on track page but matrix has no track, go to dashboard
                router.push('/dashboard');
            }
        }
    };

    // Calculate position of active button
    const activeIndex = matrices.findIndex(matrix => matrix.id === currentMatrixId);
    const topOffset = 7.5 * 16 + activeIndex * 80;
    return (
        <div className='w-[40%] border-[#020222] border-r-2 relative'>
            <div className='h-[70px] mx-4 my-4 flex flex-col justify-center'>
                <div className='bg-[#020222] w-[57.92px] h-[57.92px] rounded-full flex justify-center items-center mx-auto'>
                    <img src="/Logo.svg" alt="Logo" />
                </div>
                <div className='border-[#020222] border-b-2 w-[50px] h-[2px] mt-3 mx-auto'></div>
            </div>

            <div className='my-8 flex flex-col gap-5'>
                {loading ? (
                    ""
                ) : (
                    <>
                        {matrices.length > 0 ? (
                            matrices.map((matrix) => (
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