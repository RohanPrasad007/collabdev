"use client"
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getMatrixById, getAllMatrices } from '../services/databaseService';

const MatrixContext = createContext();

export const MatrixProvider = ({ children }) => {
  const [currentMatrixId, setCurrentMatrixId] = useState(null);
  const [currentMatrix, setCurrentMatrix] = useState(null);
  const [matrices, setMatrices] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load all matrices once
  useEffect(() => {
    const fetchAllMatrices = async () => {
      try {
        const allMatrices = await getAllMatrices();
        setMatrices(allMatrices);

        // If we have matrices but no current matrix selected yet, 
        // we'll handle this in the next useEffect
        console.log("All matrices loaded:", allMatrices.length);
      } catch (error) {
        console.error("Error loading all matrices:", error);
      }
    };

    fetchAllMatrices();
  }, []);

  // Determine current matrix from URL or select first available
  useEffect(() => {
    const determineCurrentMatrix = async () => {
      // Skip if we already have a currentMatrixId set
      if (currentMatrixId) return;

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

      // If we found an ID in the URL, use it
      if (matrixIdFromUrl) {
        console.log("Setting matrix from URL:", matrixIdFromUrl);
        setCurrentMatrixId(matrixIdFromUrl);
      }
      // Otherwise use the first available matrix if we have matrices
      else if (matrices && matrices.length > 0) {
        console.log("Setting first available matrix:", matrices[0].id);
        setCurrentMatrixId(matrices[0].id);
      }
    };

    determineCurrentMatrix();
  }, [pathname, searchParams, matrices, currentMatrixId]);

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
      setCurrentMatrixId
    }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext(MatrixContext);