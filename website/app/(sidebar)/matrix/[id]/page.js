import InteractionTools from '@/components/InteractionTools'
import PresentUsers from '@/components/PresentUser'
import React from 'react'

const page = () => {
    return (
        <div className=' bg-[#848DF9] rounded-[8px] px-7 py-3  h-[98vh] relative overflow-hidden'>
            <div className='flex justify-between'>
                <div className='flex gap-2 items-center '>
                    <img src='/voiceIcon.svg' className='w-[28px] h-[28px]' />
                    {/* <p className='text-[#000000] text-[24px] font-medium'>Voice-ch-1</p> */}
                    <p className='text-[#000000] text-[24px] font-medium'>metrix page</p>
                </div>
                <div>
                    <img src='/messager.svg' className='w-[30.63px] h-[30.63px]' />
                </div>
            </div>
            <PresentUsers />
            <InteractionTools />
        </div>
    )
}

export default page