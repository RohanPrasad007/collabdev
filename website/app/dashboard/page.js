import React from 'react'
import SidebarContainer from '../components/SidebarContainer'

const dashboard = () => {
    return (
        <div className=' w-full h-[98vh] gap-2   '>
            <div className='flex my-2  h-[98vh] gap-2 '>
                <SidebarContainer />
                <div className='w-[80%] bg-[#848DF9] rounded-[8px]'>
                    hello
                </div>
            </div>

        </div>
    )
}

export default dashboard