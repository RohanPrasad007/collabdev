"use client"
import React, { createContext, useState, useContext } from 'react';

const MatrixContext = createContext();

export const MatrixProvider = ({ children }) => {
  const [currentMatrixId, setCurrentMatrixId] = useState(null);

  return (
    <MatrixContext.Provider value={{ currentMatrixId, setCurrentMatrixId }}>
      {children}
    </MatrixContext.Provider>
  );
};

export const useMatrix = () => useContext(MatrixContext);