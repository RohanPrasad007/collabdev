import { useDialogs } from '@/context/DialogsContext';
import React, { useContext } from 'react'

const Metrixs = () => {
    const { toggleMetrixDialog } = useDialogs();

    return (
        <div className='w-[40%] border-[#020222] border-r-2 relative'>
            <div className=' h-[70px] mx-4 my-4 flex flex-col  justify-center '>
                <div className='bg-[#020222] w-[57.92px] h-[57.92px] rounded-full flex justify-center items-center mx-auto'>
                    <img src="/Logo.svg" alt="Logo" />
                </div>
                <div className='border-[#020222] border-b-2 w-[50px] h-[2px] mt-3 mx-auto'></div>
            </div>
            <div className='my-8 flex flex-col gap-5'>

                <div className='bg-[#020222] w-[59px] h-[59px] rounded-full flex justify-center items-center mx-auto cursor-pointer' onClick={toggleMetrixDialog}>
                    <img src="/add.svg" alt="Logo" />
                </div>
            </div>
            <div className='top-[7.5rem] absolute' >
                <img src="/active.svg" alt="Logo" />
            </div>
        </div>
    )
}

export default Metrixs