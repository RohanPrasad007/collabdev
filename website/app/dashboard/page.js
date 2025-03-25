"use client"
import React, { useState } from 'react'
import SidebarContainer from '../components/SidebarContainer'
import EmptyVoiceInvite from '../components/EmptyVoiceInvite'
import InteractionTools from '../components/interactionTools'
import PresentUser from '../components/PresentUser'
import CreateThread from '../components/CreateThread'
import CreateEcho from '../components/CreateEcho'
import PersonalizeYourMatrix from '../components/PersonalizeYourMatrix'

const dashboard = () => {

    return (
        <div className=' w-full h-[98vh] gap-2 relative'>
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
                    <PresentUser />
                    {/* <EmptyVoiceInvite /> */}
                    <InteractionTools />
                </div>
            </div>
            {/* <CreateThread /> */}
            {/* <CreateEcho /> */}
            {/* <PersonalizeYourMatrix /> */}



        </div>
    )
}

export default dashboard