import { useDialogs } from '@/context/DialogsContext';
import React, { useState, useRef } from 'react';
import { createNewMatrix } from '../services/databaseService';
import { useAuth } from '@/context/AuthContext'; // Assuming you have an auth context
import { useMatrix } from '../context/matrixContext'; // Import the useMatrix hook

const PersonalizeYourMatrix = () => {
    const { toggleMetrixDialog } = useDialogs();
    const [matrixName, setMatrixName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(''); // Replace with your default icon
    const fileInputRef = useRef(null);
    const { user } = useAuth();
    const { setCurrentMatrixId } = useMatrix(); // Get the setCurrentMatrixId function from the context

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);

            // Create a preview URL
            const previewURL = URL.createObjectURL(file);
            setLogoPreview(previewURL);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const uploadLogo = async () => {
        if (!logoFile) return null;

        try {
            // Convert file to base64
            const base64 = await fileToBase64(logoFile);
            return base64; // Store this string in the database
        } catch (error) {
            console.error('Error encoding logo:', error);
            setError('Failed to process logo. Please try again.');
            return null;
        }
    };

    const handleCreateMatrix = async () => {
        // Validate input
        if (!matrixName.trim()) {
            setError('Please enter a matrix name');
            return;
        }

        if (!user) {
            setError('You must be logged in to create a matrix');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Upload the logo if one was selected
            const logoUrl = await uploadLogo();

            // Create the matrix object based on your schema
            const newMatrix = {
                name: matrixName.trim(),
                logo: logoUrl || '', // Use default if no custom logo
                echoes: [],
                threads: [],
                track: null,
                users: [user.uid],
                permissions: {
                    [user.uid]: {
                        user_id: user.uid,
                        role: 'admin'
                    }
                }
            };

            // Call your database service to create the matrix
            const createdMatrix = await createNewMatrix(newMatrix);

            console.log('Matrix created successfully:', createdMatrix);

            // Set the current matrix ID in the context
            setCurrentMatrixId(createdMatrix.matrix_id);

            // Close the dialog
            toggleMetrixDialog();

            // You might want to redirect to the new matrix or refresh the list
            // router.push(`/matrix/${createdMatrix.matrix_id}`);

        } catch (error) {
            console.error('Error creating matrix:', error);
            setError('Failed to create matrix. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className='absolute top-0 w-full h-[98vh] bg-black/70 flex justify-center items-center'>
            <div className='w-[615px] h-[430px] bg-[#020222] border-[1px] border-[#848DF9] drop-shadow-2xl rounded-[12px] 
                py-[12px] px-[23px] relative text-center '>

                <div className='flex justify-end '>
                    <img
                        src='/close-toggle.svg'
                        className='cursor-pointer'
                        onClick={toggleMetrixDialog}
                        alt="Close"
                    />
                </div>
                <div className='text-[#E2E2FE] font-semibold text-[20px] mb-[8px]'>
                    Personalize Your Matrix
                </div>
                <div className='w-full flex justify-center mb-[20px]'>
                    <div className='w-[405px] h-[42px] text-[#E2E2FE]/80 font-normal text-[14px]'>
                        Set up your Matrix with a name and an icon—customize it now, update it anytime.
                    </div>
                </div>

                {/* Logo upload section */}
                <div className='flex justify-center mb-[16px]'>
                    <div
                        className='cursor-pointer relative w-[64px] h-[64px] rounded-full overflow-hidden flex items-center justify-center'
                        onClick={handleIconClick}
                    >
                        {logoPreview ? (
                            <img
                                src={logoPreview}
                                alt="Matrix Logo"
                                className='w-full h-full object-cover'
                            />
                        ) : (
                            <img src='/upload-icon.svg' alt="Upload Icon" />
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className='hidden'
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>

                {/* Matrix name input */}
                <div>
                    <div className='font-bold text-[14px] text-[#E2E2FE] mb-2 text-start'>MATRIX NAME</div>
                    <div className='w-[544px] h-[50px] bg-[#0A0A3A] border-[1px] border-[#848DF9] px-[25px] outline-none rounded-[8px] flex items-center gap-2'>
                        <input
                            className='w-full h-full bg-[#0A0A3A] outline-none rounded-[8px] placeholder:text-[#E2E2FE]/70 text-[14px] italic text-[#E2E2FE]'
                            placeholder='Enter Matrix Name'
                            value={matrixName}
                            onChange={(e) => setMatrixName(e.target.value)}
                        />
                    </div>

                    {/* Error message display */}
                    {error && (
                        <div className='text-start text-[12px] font-medium text-red-500 mt-1'>
                            {error}
                        </div>
                    )}

                    <div className='text-start text-[12px] font-light italic text-[#E2E2FE]/80 my-[4px]'>
                        By creating a Matrix, you accept <span className='text-[#848DF9]'>CollabDev's Guidelines</span>.
                    </div>
                </div>

                {/* Create button */}
                <div className='flex justify-end items-end absolute right-[34px] bottom-[28px]'>
                    <button
                        className={`w-[100px] h-[40px] ${isLoading ? 'bg-[#848DF9]/50' : 'bg-[#848DF9]'} drop-shadow-md rounded-[8px] flex justify-center items-center text-[#E2E2FE] cursor-pointer`}
                        onClick={handleCreateMatrix}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PersonalizeYourMatrix;