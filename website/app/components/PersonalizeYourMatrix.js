import React from 'react'

const PersonalizeYourMatrix = () => {
    return (
        <div className='absolute top-0 w-full h-[98vh] bg-black/70 flex justify-center items-center'>
            <div className='w-[615px] h-[430px] bg-[#020222] border-[1px] border-[#848DF9] drop-shadow-2xl rounded-[12px] 
py-[12px] px-[23px] relative text-center '>

                <div className='flex justify-end '>
                    <img src='/close-toggle.svg' />
                </div>
                <div className='text-[#E2E2FE] font-semibold text-[20px] mb-[8px]'>
                    Personalize Your Matrix
                </div>
                <div className='w-full flex justify-center mb-[20px]'>
                    <div className='w-[405px]  h-[42px] text-[#E2E2FE]/80 font-normal text-[14px]'>
                        Set up your Matrix with a name and an icon—customize it now, update it anytime.
                    </div>
                </div>
                <div className='flex justify-center mb-[16px]'>
                    <img src='/upload-icon.svg' />
                </div>
                <div>
                    <div className='font-bold text-[14px] text-[#E2E2FE] mb-2 text-start'>MATRIX NAME</div>
                    <div className='w-[544px]  h-[50px] bg-[#0A0A3A] border-[1px] border-[#848DF9] px-[25px] outline-none rounded-[8px] flex items-center gap-2'>

                        <input className='w-full h-full bg-[#0A0A3A] outline-none rounded-[8px] placeholder:text-[#E2E2FE]/70 text-[14px] italic' placeholder='Enter Matrix Name' />
                    </div>
                    <div className='text-start text-[12px] font-light italic text-[#E2E2FE]/80 my-[4px]'>
                        By creating a Matrix, you accept <span className='text-[#848DF9]'>CollabDev's Guidelines</span>.
                    </div>
                </div>

                <div className='flex justify-end items-end absolute  right-[34px] bottom-[28px]  '>
                    <div className='w-[100px] h-[40px] bg-[#848DF9] drop-shadow-md rounded-[8px] flex justify-center items-center'>
                        Create
                    </div>
                </div>

            </div>
        </div>
    )
}

export default PersonalizeYourMatrix