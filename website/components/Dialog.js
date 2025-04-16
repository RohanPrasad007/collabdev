"use client"
import { useDialogs } from '@/context/DialogsContext';
import React from 'react'
import CreateThread from './CreateThread';
import CreateEcho from './CreateEcho';
import PersonalizeYourMatrix from './PersonalizeYourMatrix';

const Dialog = () => {
    const { openMetrixDialog, openThreadDialog, openEchoDialog } = useDialogs();
    return (
        <div>
            {openThreadDialog &&
                <CreateThread />
            }
            {openEchoDialog &&
                <CreateEcho />
            }
            {openMetrixDialog &&
                <PersonalizeYourMatrix />
            }
        </div>

    )
}
export default Dialog