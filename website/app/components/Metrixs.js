import { useDialogs } from '@/context/DialogsContext';
import { useAuth } from '@/context/AuthContext';
import { useMatrix } from '@/context/matrixContext';
import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config';

const Metrixs = () => {
    const { toggleMetrixDialog } = useDialogs();
    const { user } = useAuth();
    const { setCurrentMatrixId } = useMatrix();
    const [matrices, setMatrices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Reference to the matrices in the Realtime Database
        const matricesRef = ref(database, 'matrices');
        
        // Use onValue instead of get to listen for real-time updates
        const unsubscribe = onValue(matricesRef, (snapshot) => {
            if (snapshot.exists()) {
                const matricesData = snapshot.val();
                // Filter matrices to only include those where the user is included
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

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, [user]);

    const handleMatrixClick = (matrixId) => {
        setCurrentMatrixId(matrixId);
    };

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
                            matrices.map((matrix, index) => (
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
            <div className='top-[7.5rem] absolute'>
                <img src="/active.svg" alt="Active" />
            </div>
        </div>
    );
};

export default Metrixs;