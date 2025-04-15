import React from 'react'
import Metrixs from './Metrixs'
import ActionBar from './ActionBar'
import { useDialogs } from '@/context/DialogsContext'
import Threads from './Threads'
import Echos from './Echos'

const SidebarContainer = () => {
    const { toggleThreadDialog, toggleEchoDialog } = useDialogs()
    return (
        <div className='w-[20%]  bg-[#C0C3E3] rounded-[8px] flex relative'>
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
                <Threads/>
                <Echos/>
            </div>
            <ActionBar />
        </div>
    )
}

export default SidebarContainer