import React from 'react'

const dashboard = () => {
    return (
        <div className=' w-full h-[98vh] gap-2   '>
            <div className='flex my-2  h-[98vh] gap-2 '>
                <div className='w-[20%]  bg-[#C0C3E3] rounded-[8px] flex '>
                    <div className='w-[40%] border-[#020222] border-r-2 relative'>
                        <div className=' h-[70px] mx-4 my-4 flex flex-col  justify-center '>
                            <div className='bg-[#020222] w-[57.92px] h-[57.92px] rounded-full flex justify-center items-center mx-auto'>
                                <img src="/Logo.svg" alt="Logo" />
                            </div>
                            <div className='border-[#020222] border-b-2 w-[50px] h-[2px] mt-3 mx-auto'></div>
                        </div>
                        <div className='my-8 flex flex-col gap-5'>
                            <div className='bg-[#020222] w-[59px] h-[59px] rounded-full flex justify-center items-center mx-auto relative'>
                                <p className='text-[#FFFFFF] text-[12px] '>DnD</p>
                                <div className='w-[12px] h-[12px] bg-[#008F32] rounded-full absolute top-[1px] right-[4px]'></div>
                                <div className='w-[12px] h-[12px] bg-[#E33629] rounded-full absolute bottom-[3px] left-[5px]'></div>
                            </div>
                            <div className='bg-[#020222] w-[59px] h-[59px] rounded-full flex justify-center items-center mx-auto'>
                                <p className='text-[#FFFFFF] text-[12px] '>RP</p>
                            </div>
                            <div className='bg-[#020222] w-[59px] h-[59px] rounded-full flex justify-center items-center mx-auto'>
                                <p className='text-[#FFFFFF] text-[12px] '>RC</p>
                            </div>
                            <div className='bg-[#020222] w-[59px] h-[59px] rounded-full flex justify-center items-center mx-auto'>
                                <img src="/add.svg" alt="Logo" />
                            </div>
                        </div>
                        <div className='top-[7.5rem] absolute'>
                            <img src="/active.svg" alt="Logo" />
                        </div>
                    </div>
                    <div className='w-full'>
                        rfjiwefj
                    </div>
                </div>
                <div className='w-[80%] bg-[#848DF9] rounded-[8px]'>
                    hello
                </div>
            </div>

        </div>
    )
}

export default dashboard