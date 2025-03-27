import React from 'react'

const EmptyVoiceInvite = () => {
    return (
        <div className='flex flex-col lg:flex-col justify-center items-center min-h-[80%] gap-8 md:gap-[16px] p-4'>

            <div className='bg-[#020222] w-full md:w-[500px] h-[325px]  rounded-[40px] flex flex-col justify-end items-center relative '>
                <div className='absolute -top-[18px]'>
                    <img src='/voice-empty.svg' />
                </div>
                <div className='w-[330px] h-[60px] font-bold text-[20px] text-center text-[#E2E2FE]'>
                    No one’s here yet! Invite someone to start working together.
                </div>
                <div className='w-[199px] h-[48px] bg-[#E433F5] rounded-full flex justify-center items-center gap-1 mb-5 mt-4'>
                    <img src='/invite-logo.svg' />
                    <div className='font-semibold  text-[16px] text-[#E2E2FE] mt-1'>
                        <p>Invite Collaborator</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmptyVoiceInvite