"use client"
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getMatrixById, getUserMatrices, getUserThreads } from '../services/databaseService';
import { ref, onValue } from 'firebase/database';
import { database } from '../config';
import { useUserProfile } from './UserProfileContext';

const MatrixContext = createContext();

export const MatrixProvider = ({ children }) => {
  const { userProfile } = useUserProfile();
  const [currentMatrixId, setCurrentMatrixId] = useState(null);
  const [currentMatrix, setCurrentMatrix] = useState(null);
  const [matrices, setMatrices] = useState([]);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load matrices and threads for the current user
  useEffect(() => {
    if (!userProfile || !userProfile?.uid) {
      setMatrices([]);
      setThreads([]);
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Get matrices for this user
        const userMatrices = await getUserMatrices(userProfile?.uid);
        setMatrices(userMatrices);

        // Get threads for this user's matrices
        const userThreads = await getUserThreads(userProfile?.uid);
        setThreads(userThreads);

        // If no current matrix is set, determine one
        if (!currentMatrixId && userMatrices.length > 0) {
          determineCurrentMatrix(userMatrices);
        } else if (currentMatrixId && !userMatrices.some(m => m.id === currentMatrixId)) {
          // If current matrix is no longer accessible, reset it
          setCurrentMatrixId(userMatrices.length > 0 ? userMatrices[0].id : null);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Set up real-time listeners for updates
    const matricesRef = ref(database, 'matrices');
    const matricesUnsubscribe = onValue(matricesRef, () => {
      fetchUserData(); // Re-fetch when matrices change
    });

    const threadsRef = ref(database, 'threads');
    const threadsUnsubscribe = onValue(threadsRef, () => {
      fetchUserData(); // Re-fetch when threads change
    });

    return () => {
      matricesUnsubscribe();
      threadsUnsubscribe();
    };
  }, [userProfile]);

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

    // If we found an ID in the URL, verify the user has access to it
    if (matrixIdFromUrl && matricesArray.some(m => m.id === matrixIdFromUrl)) {
      setCurrentMatrixId(matrixIdFromUrl);
    }
    // Otherwise use the first available matrix
    else if (matricesArray.length > 0) {
      setCurrentMatrixId(matricesArray[0].id);
    }
  };

  useEffect(() => {
    const loadMatrix = async () => {
      if (currentMatrixId && userProfile) {
        try {
          const matrix = await getMatrixById(currentMatrixId);

          // Check if user has access according to the actual database structure
          let hasAccess = false;

          // Creator check
          if (matrix.createdBy === userProfile.uid) {
            hasAccess = true;
          }
          // Direct permission check
          else if (matrix.permissions && userProfile.uid in matrix.permissions) {
            hasAccess = true;
          }
          // Check if user exists in the users array at matrix level
          else if (
            matrix.users &&
            Array.isArray(matrix.users) &&
            matrix.users.includes(userProfile.uid)
          ) {
            hasAccess = true;
          }
          // Check if user has numeric index in users array (as seen in screenshot)
          else if (
            matrix.users &&
            typeof matrix.users === 'object'
          ) {
            // Check all values in the users object for this userId
            for (const value of Object.values(matrix.users)) {
              if (value === userProfile.uid) {
                hasAccess = true;
                break;
              }
            }
          }

          if (matrix && hasAccess) {
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
          } else {
            console.error("User does not have access to this matrix");
            setCurrentMatrix(null);

            // Redirect to home if user doesn't have access
            if (pathname && (pathname.includes('/matrix/') || pathname.includes('/join/'))) {
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

    if (userProfile) {
      loadMatrix();
    }
  }, [currentMatrixId, userProfile, router, pathname]);

  return (
    <MatrixContext.Provider value={{
      currentMatrixId,
      currentMatrix,
      matrices,
      threads,
      isLoading,
      setCurrentMatrixId
    }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext(MatrixContext);