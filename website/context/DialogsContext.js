"use client"
import React, { createContext, useState, useContext } from 'react'

// Create a context for the dialogs
const DialogsContext = createContext();

// Create a provider component
export const DialogsProvider = ({ children }) => {
    // State for controlling the metrics dialog
    const [openMetrixDialog, setOpenMetrixDialog] = useState(false);
    const [openThreadDialog, setOpenThreadDialog] = useState(false);
    const [openEchoDialog, setOpenEchoDialog] = useState(false);

    // Function to toggle the dialog
    const toggleMetrixDialog = () => {
        setOpenMetrixDialog(prev => !prev);
    };
    const toggleThreadDialog = () => {
        setOpenThreadDialog(prev => !prev);
    };
    const toggleEchoDialog = () => {
        setOpenEchoDialog(prev => !prev);
    };

    return (
        <DialogsContext.Provider value={{
            openMetrixDialog,
            setOpenMetrixDialog,
            toggleMetrixDialog,
            openThreadDialog,
            setOpenThreadDialog,
            toggleThreadDialog,
            openEchoDialog,
            setOpenEchoDialog,
            toggleEchoDialog
        }}>
            {children}
        </DialogsContext.Provider>
    );
};

export const useDialogs = () => {
    const context = useContext(DialogsContext);
    if (!context) {
        throw new Error('useDialogs must be used within a DialogsProvider');
    }
    return context;
};
