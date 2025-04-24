"use client"
import React from 'react'
import Metrixs from './Metrixs'
import ActionBar from './ActionBar'
import Threads from './Threads'
import Echos from './Echos'
import Track from './Track'
import Join from './Join'
import { useMatrix } from '../context/matrixContext'

const SidebarContainer = () => {
    const { currentMatrixId } = useMatrix();
    return (
        <div className='w-[100%] h-full  bg-[#C0C3E3] rounded-[8px] flex relative'>
            <Metrixs />
            {currentMatrixId ? <div className='w-full'>
                <Join />
                <div className='h-[60px] border-[#020222] border-b-2 flex justify-start gap-2 items-end px-5 py-1 '>
                    <Track />
                </div>
                <Threads />
                <Echos />
            </div> :
                <div className='w-full mt-[13px] flex flex-col  items-center gap-[19px]'>
                    <div className='w-[260px] bg-[#8F92B6] h-[33px] rounded-[8px] ' />
                    <div className='w-[230px] bg-[#8F92B6] h-[33px] rounded-[8px] ' />
                    <div className='w-[230px] bg-[#8F92B6] h-[33px] rounded-[8px] ' />
                    <div className='w-[230px] bg-[#8F92B6] h-[33px] rounded-[8px] ' />
                    <div className='w-[230px] bg-[#8F92B6] h-[33px] rounded-[8px] ' />
                    <div className='w-[230px] bg-[#8F92B6] h-[33px] rounded-[8px] ' />
                </div>
            }
            <ActionBar />
        </div>
    )
}

export default SidebarContainer