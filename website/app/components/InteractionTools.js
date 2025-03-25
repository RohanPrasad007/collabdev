import React from 'react'

const InteractionTools = () => {
    return (
        <div className='absolute bottom-0 w-[97%]' >
            <div className='flex justify-center h-[130px] items-center gap-[1rem]'>
                <div className='bg-[#020222] w-[60px] h-[60px] rounded-full flex justify-center items-center  cursor-pointer'>
                    <img src='/video-call.svg' className='w-[38.4px] h-[38.4px]' />
                </div>
                <div className='bg-[#020222] w-[60px] h-[60px] rounded-full flex justify-center items-center  cursor-pointer'>
                    <img src='/mic.svg' className='w-[30px] h-[30px]' />
                </div>
                <div className='bg-[#020222] w-[60px] h-[60px] rounded-full flex justify-center items-center  cursor-pointer'>
                    <img src='/screen-share.svg' className='w-[38.4px] h-[38.4px]' />
                </div>
                <div className='bg-[#E33629] w-[60px] h-[60px] rounded-full flex justify-center items-center  cursor-pointer'>
                    <img src='/call-hang-up.svg' className='w-[30px] h-[30px]' />
                </div>
            </div>
        </div>
    )
}

export default InteractionTools