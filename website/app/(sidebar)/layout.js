import Dialog from '../../components/Dialog';
import SidebarContainer from '../../components/SidebarContainer';

export default function SidebarLayout({ children }) {
    return (
        <div className=' w-full h-[98vh] gap-2 relative'>
            <div className='flex my-2  h-[98vh] gap-2 '>
                <div className='w-[500px]  h-[98vh]'>
                    <SidebarContainer />
                </div>
                <div className='w-full'>
                    {children}
                </div>

            </div>
            <Dialog />
        </div>
    );
}