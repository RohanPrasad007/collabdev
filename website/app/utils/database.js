// utils/database.js
import { ref, set, get, push, update, remove } from 'firebase/database';
import { database } from '../../config';

// Matrix CRUD operations
export const createMatrix = async (matrixData) => {
  const matrixRef = ref(database, `matrices/${matrixData.matrix_id}`);
  await set(matrixRef, matrixData);
  return matrixData.matrix_id;
};

export const getMatrix = async (matrixId) => {
  const matrixRef = ref(database, `matrices/${matrixId}`);
  const snapshot = await get(matrixRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const updateMatrix = async (matrixId, updates) => {
  const matrixRef = ref(database, `matrices/${matrixId}`);
  await update(matrixRef, updates);
  return matrixId;
};

export const deleteMatrix = async (matrixId) => {
  const matrixRef = ref(database, `matrices/${matrixId}`);
  await remove(matrixRef);
  return matrixId;
};

export const getAllMatrices = async () => {
  const matricesRef = ref(database, 'matrices');
  const snapshot = await get(matricesRef);
  return snapshot.exists() ? snapshot.val() : {};
};

// Echo CRUD operations
export const createEcho = async (echoData) => {
  const echoRef = ref(database, `echoes/${echoData.echo_id}`);
  await set(echoRef, echoData);
  return echoData.echo_id;
};

export const getEcho = async (echoId) => {
  const echoRef = ref(database, `echoes/${echoId}`);
  const snapshot = await get(echoRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const updateEcho = async (echoId, updates) => {
  const echoRef = ref(database, `echoes/${echoId}`);
  await update(echoRef, updates);
  return echoId;
};

export const deleteEcho = async (echoId) => {
  const echoRef = ref(database, `echoes/${echoId}`);
  await remove(echoRef);
  return echoId;
};

export const getAllEchoes = async () => {
  const echoesRef = ref(database, 'echoes');
  const snapshot = await get(echoesRef);
  return snapshot.exists() ? snapshot.val() : {};
};

// Thread CRUD operations
export const createThread = async (threadData) => {
  const threadRef = ref(database, `threads/${threadData.thread_id}`);
  await set(threadRef, threadData);
  return threadData.thread_id;
};

export const getThread = async (threadId) => {
  const threadRef = ref(database, `threads/${threadId}`);
  const snapshot = await get(threadRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const updateThread = async (threadId, updates) => {
  const threadRef = ref(database, `threads/${threadId}`);
  await update(threadRef, updates);
  return threadId;
};

export const deleteThread = async (threadId) => {
  const threadRef = ref(database, `threads/${threadId}`);
  await remove(threadRef);
  return threadId;
};

export const getAllThreads = async () => {
  const threadsRef = ref(database, 'threads');
  const snapshot = await get(threadsRef);
  return snapshot.exists() ? snapshot.val() : {};
};

// Message operations
export const addMessageToThread = async (threadId, messageData) => {
  const threadRef = ref(database, `threads/${threadId}/messages`);
  const newMessageRef = push(threadRef);
  await set(newMessageRef, messageData);
  return newMessageRef.key;
};

// File operations
export const addFileToThread = async (threadId, fileData) => {
  const fileRef = ref(database, `threads/${threadId}/files/${fileData.file_id}`);
  await set(fileRef, fileData);
  return fileData.file_id;
};

export const removeFileFromThread = async (threadId, fileId) => {
  const fileRef = ref(database, `threads/${threadId}/files/${fileId}`);
  await remove(fileRef);
  return fileId;
};

// Matrix relationships
export const addEchoToMatrix = async (matrixId, echoId) => {
  const matrixRef = ref(database, `matrices/${matrixId}`);
  const snapshot = await get(matrixRef);
  
  if (snapshot.exists()) {
    const matrixData = snapshot.val();
    const echoes = matrixData.echoes || [];
    
    if (!echoes.includes(echoId)) {
      echoes.push(echoId);
      await update(matrixRef, { echoes });
    }
    
    return echoId;
  }
  
  throw new Error(`Matrix with ID ${matrixId} not found`);
};

export const addThreadToMatrix = async (matrixId, threadId) => {
  const matrixRef = ref(database, `matrices/${matrixId}`);
  const snapshot = await get(matrixRef);
  
  if (snapshot.exists()) {
    const matrixData = snapshot.val();
    const threads = matrixData.threads || [];
    
    if (!threads.includes(threadId)) {
      threads.push(threadId);
      await update(matrixRef, { threads });
    }
    
    return threadId;
  }
  
  throw new Error(`Matrix with ID ${matrixId} not found`);
};

export const addUserToMatrix = async (matrixId, userId, role = 'member') => {
  const matrixRef = ref(database, `matrices/${matrixId}`);
  const snapshot = await get(matrixRef);
  
  if (snapshot.exists()) {
    const matrixData = snapshot.val();
    const users = matrixData.users || [];
    const permissions = matrixData.permissions || {};
    
    if (!users.includes(userId)) {
      users.push(userId);
      permissions[userId] = { user_id: userId, role };
      await update(matrixRef, { users, permissions });
    }
    
    return userId;
  }
  
  throw new Error(`Matrix with ID ${matrixId} not found`);
};

// Generate unique IDs
export const generateUniqueId = (prefix = '') => {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};