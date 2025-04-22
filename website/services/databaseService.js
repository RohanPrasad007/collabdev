// services/databaseService.js
import { Matrix } from '../model/Matrix';
import { ref, set, get, update, push } from 'firebase/database';
import * as db from '../utils/database';
import { database } from '@/config';
import { Thread } from '../model/Thread';
import { Message } from '../model/Message';
import { Echo } from '../model/Echo';
import { Track } from '../model/Track';

// Create a new matrix
export const createNewMatrix = async (matrixData) => {
  try {
    const matrix = new Matrix(matrixData);
    // Be aware that base64 images can be large
    const matrixRef = ref(database, `matrices/${matrix.matrix_id}`);
    await set(matrixRef, matrix);
    return matrix;
  } catch (error) {
    console.error('Error creating matrix:', error);
    throw error;
  }
};

// Get a matrix by ID
export const getMatrixById = async (matrixId) => {
  try {
    const matrixRef = ref(database, `matrices/${matrixId}`);
    const snapshot = await get(matrixRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return null;
  } catch (error) {
    console.error('Error getting matrix:', error);
    throw error;
  }
};

// Update a matrix
export const updateMatrix = async (matrixId, updates) => {
  try {
    const matrixRef = ref(database, `matrices/${matrixId}`);
    await update(matrixRef, updates);

    // Return the updated matrix
    return await getMatrixById(matrixId);
  } catch (error) {
    console.error('Error updating matrix:', error);
    throw error;
  }
};

// Add an echo to a matrix
export const addEchoToMatrix = async (matrixId, echoId) => {
  try {
    const matrix = await getMatrixById(matrixId);

    if (!matrix) {
      throw new Error(`Matrix with ID ${matrixId} not found`);
    }

    const echoes = matrix.echoes || [];

    if (!echoes.includes(echoId)) {
      echoes.push(echoId);
      await updateMatrix(matrixId, { echoes });
    }

    return echoId;
  } catch (error) {
    console.error('Error adding echo to matrix:', error);
    throw error;
  }
};

// Add a thread to a matrix
export const addThreadToMatrix = async (matrixId, threadId) => {
  try {
    const matrix = await getMatrixById(matrixId);

    if (!matrix) {
      throw new Error(`Matrix with ID ${matrixId} not found`);
    }

    const threads = matrix.threads || [];

    if (!threads.includes(threadId)) {
      threads.push(threadId);
      await updateMatrix(matrixId, { threads });
    }

    return threadId;
  } catch (error) {
    console.error('Error adding thread to matrix:', error);
    throw error;
  }
};

// Add a user to a matrix with a specific role
export const addUserToMatrix = async (matrixId, userId, role = 'member') => {
  try {
    const matrix = await getMatrixById(matrixId);

    if (!matrix) {
      throw new Error(`Matrix with ID ${matrixId} not found`);
    }

    const users = matrix.users || [];
    const permissions = matrix.permissions || {};

    if (!users.includes(userId)) {
      users.push(userId);
      permissions[userId] = { user_id: userId, role };
      await updateMatrix(matrixId, { users, permissions });
    }

    return userId;
  } catch (error) {
    console.error('Error adding user to matrix:', error);
    throw error;
  }
};

// Echo Services
export const createNewEcho = async (echoData, matrixId = null) => {
  const echo = new Echo(echoData);
  await db.createEcho(echo);

  if (matrixId) {
    await db.addEchoToMatrix(matrixId, echo.echo_id);
  }

  return echo;
};

export const getEchoById = async (echoId) => {
  return await db.getEcho(echoId);
};

export const updateEchoDetails = async (echoId, updates) => {
  await db.updateEcho(echoId, updates);
  return await db.getEcho(echoId);
};

export const deleteEchoById = async (echoId) => {
  return await db.deleteEcho(echoId);
};

export const getAllEchoList = async () => {
  return await db.getAllEchoes();
};

// Thread Services
export const createNewThread = async (threadData, matrixId = null) => {
  // Create the thread with all required fields
  const thread = new Thread({
    ...threadData,
    created_at: new Date().toISOString(),
    created_by: threadData.created_by || null
  });

  // Create the thread in the database
  await db.createThread(thread);

  // If matrixId is provided, add this thread to the matrix's threads array
  if (matrixId) {
    await db.addThreadToMatrix(matrixId, thread.thread_id);
  }

  return thread;
};

export const getThreadById = async (threadId) => {
  return await db.getThread(threadId);
};

export const updateThreadDetails = async (threadId, updates) => {
  await db.updateThread(threadId, updates);
  return await db.getThread(threadId);
};

export const deleteThreadById = async (threadId) => {
  return await db.deleteThread(threadId);
};

export const getAllThreadList = async () => {
  return await db.getAllThreads();
};

// Message Services
export const addMessageToThread = async (threadId, userId, content) => {
  const message = {
    user_id: userId,
    date_time: new Date().toISOString(),
    content: content
  };

  const threadRef = ref(database, `threads/${threadId}/messages`);
  const newMessageRef = push(threadRef);
  await set(newMessageRef, message);
  return newMessageRef.key;
};


// File Services
export const addFileToThread = async (threadId, fileData) => {
  const file = {
    file_id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    file_url: fileData.url,
    upload_time: new Date().toISOString(),
    delete_after: fileData.deleteAfter || null,
    uploaded_by: fileData.userId
  };

  const fileRef = ref(database, `threads/${threadId}/files/${file.file_id}`);
  await set(fileRef, file);
  return file.file_id;
};

export const removeFileFromThread = async (threadId, fileId) => {
  return await db.removeFileFromThread(threadId, fileId);
};

// Matrix Relationship Services
export const addUserToMatrixWithRole = async (matrixId, userId, role = 'member') => {
  return await db.addUserToMatrix(matrixId, userId, role);
};


// Create a new track
export const createNewTrack = async (trackData) => {
  try {
    const track = new Track(trackData);
    const trackRef = ref(database, `tracks/${track.track_id}`);
    await set(trackRef, track);
    return track;
  } catch (error) {
    console.error('Error creating track:', error);
    throw error;
  }
};

// Get a track by ID
export const getTrackById = async (trackId) => {
  try {
    const trackRef = ref(database, `tracks/${trackId}`);
    const snapshot = await get(trackRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return null;
  } catch (error) {
    console.error('Error getting track:', error);
    throw error;
  }
};

// Update track in matrix
export const updateMatrixTrack = async (matrixId, trackId) => {
  try {
    const matrixRef = ref(database, `matrices/${matrixId}`);
    await update(matrixRef, { track: trackId });
    return trackId;
  } catch (error) {
    console.error("Error updating matrix track:", error);
    throw error;
  }
};

// Add these functions to your databaseService.js file

export const getUserMatrices = async (userId) => {
  if (!userId) {
    console.error('No user ID provided for getUserMatrices');
    return [];
  }

  try {
    const matricesRef = ref(database, 'matrices');
    const snapshot = await get(matricesRef);

    if (snapshot.exists()) {
      const matricesObject = snapshot.val();
      const allMatrices = [];

      // Process each matrix
      for (const [matrixId, matrixData] of Object.entries(matricesObject)) {
        let hasAccess = false;

        // Check if the user is the creator (if createdBy field exists)
        if (matrixData.createdBy === userId) {
          hasAccess = true;
        }
        // Check if the user has permissions directly under the permissions object
        else if (matrixData.permissions && userId in matrixData.permissions) {
          hasAccess = true;
        }
        // Check if user exists in the users array at matrix level
        else if (
          matrixData.users &&
          Array.isArray(matrixData.users) &&
          matrixData.users.includes(userId)
        ) {
          hasAccess = true;
        }
        // Check if user has numeric index in users array (as seen in screenshot)
        else if (
          matrixData.users &&
          typeof matrixData.users === 'object'
        ) {
          // Check all values in the users object for this userId
          for (const value of Object.values(matrixData.users)) {
            if (value === userId) {
              hasAccess = true;
              break;
            }
          }
        }

        if (hasAccess) {
          allMatrices.push({
            id: matrixId,
            ...matrixData
          });
        }
      }

      return allMatrices;
    }

    return [];
  } catch (error) {
    console.error('Error getting user matrices:', error);
    throw error;
  }
};

// Get threads for specific user's matrices
export const getUserThreads = async (userId) => {
  if (!userId) {
    console.error('No user ID provided for getUserThreads');
    return [];
  }

  try {
    // First get the user's matrices
    const userMatrices = await getUserMatrices(userId);
    const matrixIds = userMatrices.map(matrix => matrix.id);

    // If user has no matrices, return empty array
    if (matrixIds.length === 0) {
      return [];
    }

    // Get all threads
    const threadsRef = ref(database, 'threads');
    const snapshot = await get(threadsRef);

    if (snapshot.exists()) {
      const threadsObject = snapshot.val();
      const allThreads = Object.entries(threadsObject).map(([id, data]) => ({
        thread_id: id,
        ...data
      }));

      // Filter threads that belong to user's matrices
      return allThreads.filter(thread =>
        matrixIds.includes(thread.matrix_id)
      );
    }

    return [];
  } catch (error) {
    console.error('Error getting user threads:', error);
    throw error;
  }
};

// Keep original functions for other parts of the app that might need them
export const getAllMatrices = async () => {
  try {
    const matricesRef = ref(database, 'matrices');
    const snapshot = await get(matricesRef);

    if (snapshot.exists()) {
      const matricesObject = snapshot.val();
      return Object.entries(matricesObject).map(([id, data]) => ({
        id,
        ...data
      }));
    }

    return [];
  } catch (error) {
    console.error('Error getting all matrices:', error);
    throw error;
  }
};

export const getAllThreads = async () => {
  try {
    const threadsRef = ref(database, 'threads');
    const snapshot = await get(threadsRef);

    if (snapshot.exists()) {
      const threadsObject = snapshot.val();
      return Object.keys(threadsObject).map(key => ({
        thread_id: key,
        ...threadsObject[key]
      }));
    }

    return [];
  } catch (error) {
    console.error('Error getting all threads:', error);
    throw error;
  }
};