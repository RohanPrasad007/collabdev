"use client"
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMatrixById } from '../app/services/databaseService';

const MatrixContext = createContext();

export const MatrixProvider = ({ children }) => {
  const [currentMatrixId, setCurrentMatrixId] = useState(null);
  const [currentMatrix, setCurrentMatrix] = useState(null);
  const router = useRouter();

  // Update to load matrix data when ID changes
  useEffect(() => {
    const loadMatrix = async () => {
      if (currentMatrixId) {
        try {
          const matrix = await getMatrixById(currentMatrixId);
          setCurrentMatrix(matrix);

          // Check if we're on the track page
          if (window.location.pathname.includes('/track')) {
            // If matrix has track, navigate to it
            if (matrix && matrix.track) {
              router.push(`/track?id=${matrix.track}`);
            } else {
              // If no track, go to /
              router.push('/');
            }
          }
        } catch (error) {
          console.error("Error loading matrix:", error);
          setCurrentMatrix(null);
        }
      } else {
        setCurrentMatrix(null);
      }
    };

    loadMatrix();
  }, [currentMatrixId, router]);

  return (
    <MatrixContext.Provider value={{
      currentMatrixId,
      currentMatrix,
      setCurrentMatrixId
    }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext(MatrixContext);