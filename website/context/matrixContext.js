"use client"
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getMatrixById } from '../services/databaseService';
import { ref, onValue } from 'firebase/database';
import { database } from '../config';

const MatrixContext = createContext();

export const MatrixProvider = ({ children }) => {
  const [currentMatrixId, setCurrentMatrixId] = useState(null);
  const [currentMatrix, setCurrentMatrix] = useState(null);
  const [matrices, setMatrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load all matrices in real-time
  useEffect(() => {
    const matricesRef = ref(database, 'matrices');
    const unsubscribe = onValue(matricesRef, (snapshot) => {
      if (snapshot.exists()) {
        const matricesData = snapshot.val();
        const matricesArray = Object.entries(matricesData).map(([id, data]) => ({
          id,
          ...data
        }));
        setMatrices(matricesArray);

        // If no current matrix is set, try to determine one
        if (!currentMatrixId && matricesArray.length > 0) {
          determineCurrentMatrix(matricesArray);
        }
      } else {
        setMatrices([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading matrices:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Determine current matrix from URL or select first available
  const determineCurrentMatrix = (matricesArray) => {
    // Check URL patterns for matrix ID
    let matrixIdFromUrl = null;

    // Check for /matrix/[id] pattern
    if (pathname && pathname.startsWith('/matrix/')) {
      matrixIdFromUrl = pathname.split('/matrix/')[1];
    }
    // Check for /join/[id] pattern
    else if (pathname && pathname.startsWith('/join/')) {
      matrixIdFromUrl = pathname.split('/join/')[1];
    }
    // Check for matrix_id query parameter
    else {
      const matrixIdParam = searchParams?.get('matrix_id');
      if (matrixIdParam) matrixIdFromUrl = matrixIdParam;
    }

    // If we found an ID in the URL, use it if it exists in our matrices
    if (matrixIdFromUrl && matricesArray.some(m => m.id === matrixIdFromUrl)) {
      setCurrentMatrixId(matrixIdFromUrl);
    }
    // Otherwise use the first available matrix if we have matrices
    else if (matricesArray.length > 0) {
      setCurrentMatrixId(matricesArray[0].id);
    }
  };

  // Load current matrix data when ID changes
  useEffect(() => {
    const loadMatrix = async () => {
      if (currentMatrixId) {
        try {
          const matrix = await getMatrixById(currentMatrixId);
          setCurrentMatrix(matrix);

          // Check if we're on the track page
          if (pathname && pathname.includes('/track')) {
            // If matrix has track, navigate to it
            if (matrix && matrix.track) {
              router.push(`/track/${matrix.track}`);
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
  }, [currentMatrixId, router, pathname]);

  return (
    <MatrixContext.Provider value={{
      currentMatrixId,
      currentMatrix,
      matrices,
      isLoading,
      setCurrentMatrixId
    }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext(MatrixContext);