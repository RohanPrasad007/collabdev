import Dialog from '../../components/Dialog';
import SidebarContainer from '../../components/SidebarContainer';

export default function SidebarLayout({ children }) {
    return (
        <div className=' w-full h-[98vh] gap-2 relative'>
            <div className='flex my-2  h-[98vh] gap-2 '>
                <SidebarContainer />
                {children}
            </div>
            <Dialog />
        </div>
    );
}