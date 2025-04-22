"use client"
import { useMatrix } from '../context/matrixContext';
import React, { useState } from 'react'

const Join = () => {
    const { currentMatrix } = useMatrix();
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        const joinLink = `http://localhost:3000/join/${currentMatrix.matrix_id}`;
        navigator.clipboard.writeText(joinLink)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    }

    return (
        <div className='mx-5 flex my-2 justify-between items-center'>
            <div className='text-[#000000] text-[20px] font-medium'>{currentMatrix?.name}</div>
            <div className="relative">
                <img
                    src='/add-group.png'
                    className='w-[20px] h-[20px] cursor-pointer'
                    onClick={handleCopyLink}
                    alt="Copy join link"
                />
                {copied && (
                    <div className="absolute right-0 -bottom-8 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                        Link copied!
                    </div>
                )}
            </div>
        </div>
    )
}

export default Join