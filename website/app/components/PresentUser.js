import React from 'react'
import EmptyVoiceInvite from './EmptyVoiceInvite'

const PresentUsers = ({ userCount = 1 }) => {
    return (
        <div className='flex flex-col justify-center items-center min-h-[80%] p-4'>
            <div className={`
                ${userCount > 2 ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 w-full max-w-6xl gap-8 ' : 'flex flex-col gap-8 w-[500px]'}
                
            `}>
                {[...Array(userCount)].map((_, index) => (
                    <div
                        key={index}
                        className={`
                            bg-[#020222] 
                            w-full 
                            h-[325px] 
                            rounded-[40px] 
                            flex 
                            justify-center 
                            items-center 
                            relative
                            ${index !== 0 ? 'border-[3px] border-[#E433F5]' : ''}
                        `}
                    >
                        <div className='bg-[#D9D9D9] w-[102.08px] h-[98px] rounded-full' />
                        <div className='absolute bottom-0'>
                            <p className='text-[#E2E2FE] text-[20px] font-medium mb-2'>
                                {index === 0 ? 'You' : `User ${index}`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {userCount <= 1 &&
                <EmptyVoiceInvite />
            }
        </div>
    )
}

export default PresentUsers