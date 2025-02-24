"use client"
import React, { useState } from 'react'
import SidebarContainer from '../components/SidebarContainer'
import TrackBoard from '../components/TrackBoard'
import AddTodoCard from '../components/AddTodoCard'

const Track = () => {
    const [onclose, setOnclose] = useState(false)
    const [openAddTask, setOpenAddTask] = useState(false)
    return (
        <div className=' w-full h-[98vh] gap-2 '>
            <div className='flex my-2  h-[98vh] gap-2 '>
                <SidebarContainer />
                <div className='w-[80%]  rounded-[8px]   h-[98vh] relative overflow-hidden'>
                    <div className='w-full bg-[#848DF9] rounded-[8px] px-7 py-3  h-[98vh]  overflow-hidden'>
                        <TrackBoard setOpenAddTask={setOpenAddTask} />

                    </div>
                    {openAddTask &&
                        <div className="absolute top-0 w-full h-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg">
                            <AddTodoCard setOpenAddTask={setOpenAddTask} />
                        </div>
                    }

                </div>
            </div>
        </div>
    )
}

export default Track