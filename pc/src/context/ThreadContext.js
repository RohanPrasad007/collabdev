"use client"
import { createContext, useContext, useState } from 'react';

const ThreadContext = createContext();

export function ThreadProvider({ children }) {
    const [currentThreadId, setCurrentThreadId] = useState(null);

    return (
        <ThreadContext.Provider value={{ currentThreadId, setCurrentThreadId }}>
            {children}
        </ThreadContext.Provider>
    );
}

export function useThread() {
    const context = useContext(ThreadContext);
    if (context === undefined) {
        throw new Error('useThread must be used within a ThreadProvider');
    }
    return context;
}