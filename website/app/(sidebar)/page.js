"use client"
import React, { useEffect, useState } from 'react'
import { Poppins } from 'next/font/google'
import { useRouter } from 'next/navigation'
import { useMatrix } from '@/context/matrixContext'
import { useDialogs } from '@/context/DialogsContext'

const Poppinsfont = Poppins({
    subsets: ["latin"],
    weight: ['400', '600']
})

const Page = () => {
    const { currentMatrixId, matrices } = useMatrix()
    const { toggleMetrixDialog } = useDialogs();
    const router = useRouter()
    const [matrixInput, setMatrixInput] = useState('')

    useEffect(() => {
        // Check if currentMatrixId exists and navigate to that matrix
        if (currentMatrixId) {
            router.push(`/matrix/${currentMatrixId}`)
        }
    }, [currentMatrixId, router])

    const handleJoinMatrix = (event) => {
        event.preventDefault()
        // Make sure we have a matrix ID from the input
        if (matrixInput && matrixInput.trim() !== '') {
            // Form the join URL with the matrix ID
            const joinUrl = `/join/${matrixInput.trim()}`
            // Navigate to the join URL
            router.push(joinUrl)
        }
    }

    return (
        <div className='bg-[#848DF9] rounded-[8px] px-7 py-3 h-[98vh] overflow-hidden flex justify-center items-center'>
            <div className='w-[615px] h-[400px] bg-[#020222] rounded-[16px] py-[30px] px-[18px] text-center'>
                <div className='flex flex-col justify-center items-center'>
                    <p className='font-semibold text-[#E2E2FE] text-[24px]'>Welcome to CollabDev!</p>
                    <div className='w-[440px] mt-[8px]'>
                        <p className={`${Poppinsfont.className} font-medium text-[16px] text-[#C2C2F0]`}>
                            Get started by creating a new Matrix or joining one you've been invited to.
                        </p>
                    </div>
                    <button
                        className={`bg-[#848DF9] w-[200px] h-[48px] rounded-[12px] mt-[24px] font-semibold text-[16px] text-[#FFFFFF] ${Poppinsfont.className}`}
                        onClick={toggleMetrixDialog}
                    >
                        + Create New Matrix
                    </button>
                </div>
                <div className='relative flex justify-center items-center'>
                    <div className='bg-[#444466] w-full h-[1.5px] mt-[36px]' />
                    <div className={`bg-[#020222] w-[40px] h-[31px] absolute top-[24px] ${Poppinsfont.className} font-bold text-[18px] text-[#E2E2FE]`}>
                        OR
                    </div>
                </div>
                <div className='mt-[29px]'>
                    <p className={`${Poppinsfont.className} font-medium text-[14px] text-[#E2E2FE]`}>Join with a Matrix ID</p>
                    <form onSubmit={handleJoinMatrix} className='flex gap-[10px] mx-[24px] items-center mt-[14px]'>
                        <div className='w-[400px] h-[50px] bg-[#0A0A3A] border-[1px] border-[#848DF9] px-[17px] outline-none rounded-[8px] flex items-center gap-2'>
                            <input
                                className='w-full h-full bg-[#0A0A3A] outline-none rounded-[12px] placeholder:text-[#E2E2FE]/70 text-[14px] italic text-[#E2E2FE]'
                                placeholder='matrixid8274819928'
                                value={matrixInput}
                                onChange={(e) => setMatrixInput(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`bg-[#E433F5] w-[120px] h-[48px] rounded-[12px] flex justify-center items-center text-[16px] font-semibold text-[#FFFFFF] cursor-pointer ${Poppinsfont.className}`}
                        >
                            Join
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Page