import React from 'react'
import Metrixs from './Metrixs'
import ActionBar from './ActionBar'
import { useDialogs } from '@/context/DialogsContext'
import Threads from './Threads'
import Echos from './Echos'
import Track from './Track'
import Join from './Join'

const SidebarContainer = () => {
    return (
        <div className='w-[20%]  bg-[#C0C3E3] rounded-[8px] flex relative'>
            <Metrixs />
            <div className='w-full'>
                <Join />
                <div className='h-[60px] border-[#020222] border-b-2 flex justify-start gap-2 items-end px-5 py-1 '>
                    <Track />
                </div>
                <Threads />
                <Echos />
            </div>
            <ActionBar />
        </div>
    )
}

export default SidebarContainer