import React from 'react'
import Metrixs from './Metrixs'

const SidebarContainer = () => {
    return (
        <div className='w-[20%]  bg-[#C0C3E3] rounded-[8px] flex '>
            <Metrixs />
            <div className='w-full'>
                <div className='h-[60px] border-[#020222] border-b-2 flex justify-start gap-2 items-end px-5 py-1 '>
                    <div className='flex  items-center gap-2 '>
                        <div>
                            <img src='/track.svg' />
                        </div>
                        <div className='text-[24px] text-[#000000] font-medium '>
                            Track
                        </div>
                    </div>

                </div>
                <div>
                    <div className='h-[60px] border-[#020222] border-b-2 flex justify-start gap-2 items-end px-2 py-1 mt-[40px]'>
                        <div className='flex  items-center gap-8 '>
                            <div className='mt-[10px]'>
                                <img src='/dropdown.svg' />
                            </div>
                            <div className='text-[24px] text-[#000000] font-medium '>
                                Threads
                            </div>
                            <div>
                                <img src='/plus.svg' />
                            </div>
                        </div>
                    </div>

                    <div className='  flex  items-end justify-center  py-1 mt-[15px]'>
                        <div className='flex flex-col gap-2'>
                            <div className='flex  items-center gap-3 '>
                                <div >
                                    <img src='/textIcon.svg' />
                                </div>
                                <div className='text-[20px] text-[#000000] font-medium '>
                                    text-ch-1
                                </div>
                                <div>
                                    <img src='/activeText.svg' />
                                </div>
                            </div>
                            <div className='flex  items-center gap-3 '>
                                <div >
                                    <img src='/textIcon.svg' />
                                </div>
                                <div className='text-[20px] text-[#000000] font-medium '>
                                    text-ch-2
                                </div>

                            </div>
                            <div className='flex  items-center gap-3 '>
                                <div >
                                    <img src='/textIcon.svg' />
                                </div>
                                <div className='text-[20px] text-[#000000] font-medium '>
                                    text-ch-3
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
                <div>
                    <div className='h-[60px] border-[#020222] border-b-2 flex justify-start gap-2 items-end px-2 py-1 mt-[40px]'>
                        <div className='flex  items-center gap-8 '>
                            <div className='mt-[10px]'>
                                <img src='/dropdown.svg' />
                            </div>
                            <div className='text-[24px] text-[#000000] font-medium '>
                                Echoes
                            </div>
                            <div>
                                <img src='/plus.svg' />
                            </div>
                        </div>
                    </div>

                    <div className='  flex  items-end justify-center  py-1 mt-[15px]'>
                        <div className='flex flex-col gap-2 '>
                            <div className='flex  items-center gap-3 '>
                                <div >
                                    <img src='/voiceIcon.svg' />
                                </div>
                                <div className='text-[20px] text-[#000000] font-medium '>
                                    Voice-ch-1
                                </div>

                            </div>
                            <div className='flex  items-center gap-3 '>
                                <div >
                                    <img src='/voiceIcon.svg' />
                                </div>
                                <div className='text-[20px] text-[#000000] font-medium '>
                                    Voice-ch-2
                                </div>

                            </div>
                            <div className='flex  items-center gap-3 '>
                                <div >
                                    <img src='/voiceIcon.svg' />
                                </div>
                                <div className='text-[20px] text-[#000000] font-medium '>
                                    Voice-ch-3
                                </div>

                            </div>

                        </div>

                    </div>

                </div>


            </div>
        </div>
    )
}

export default SidebarContainer