import React from 'react'
import SidebarContainer from '../components/SidebarContainer'

const dashboard = () => {
    return (
        <div className=' w-full h-[98vh] gap-2 '>
            <div className='flex my-2  h-[98vh] gap-2 '>
                <SidebarContainer />
                <div className='w-[80%] bg-[#848DF9] rounded-[8px] px-7 py-3  h-[98vh] relative overflow-hidden'>
                    <div className='flex justify-between'>
                        <div className='flex gap-2 items-center '>
                            <img src='/voiceIcon.svg' className='w-[28px] h-[28px]' />
                            <p className='text-[#000000] text-[24px] font-medium'>Voice-ch-1</p>
                        </div>
                        <div>
                            <img src='/messager.svg' className='w-[30.63px] h-[30.63px]' />
                        </div>
                    </div>
                    <div className='flex flex-col lg:flex-row justify-center items-center min-h-[80%] gap-8 md:gap-[4.5rem] p-4'>
                        <div className='bg-[#020222] w-full md:w-[400px] h-[298px] rounded-[40px] flex justify-center items-center relative'>
                            <div className='bg-[#D9D9D9] w-[102.08px] h-[98px] rounded-full' />
                            <div className='absolute bottom-0'>
                                <p className='text-[#E2E2FE] text-[20px] font-medium mb-2'>You</p>
                            </div>
                        </div>

                        <div className='bg-[#020222] w-full md:w-[400px] h-[298px] rounded-[40px] flex justify-center items-center relative border-[#E433F5] border-[3px]'>
                            <div className='bg-[#D9D9D9] w-[102.08px] h-[98px] rounded-full' />
                            <div className='absolute bottom-0'>
                                <p className='text-[#E2E2FE] text-[20px] font-medium mb-2'>User</p>
                            </div>
                        </div>
                    </div>
                    <div className='absolute bottom-0 w-[97%] ' >
                        <div className='flex justify-center h-[100px] items-center gap-[1rem]'>
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
                </div>
            </div>

        </div>
    )
}

export default dashboard