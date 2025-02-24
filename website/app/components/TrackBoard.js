"use client"
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { database } from '../../config'; // Import your firebase setup
import { ref, onValue, update, set, remove } from 'firebase/database';

const TrackBoard = (props) => {
    // Initialize with empty data structure that matches your drag-and-drop requirements
    const [boardData, setBoardData] = useState({
        columns: {
            'todo': {
                id: 'todo',
                title: 'To Do',
                taskIds: []
            },
            'in-progress': {
                id: 'in-progress',
                title: 'In Progress',
                taskIds: []
            },
            'done': {
                id: 'done',
                title: 'Done',
                taskIds: []
            }
        },
        columnOrder: ['todo', 'in-progress', 'done'],
        tasks: {}
    });

    const [loading, setLoading] = useState(true);

    // Fetch tasks from Firebase
    useEffect(() => {
        const tasksRef = ref(database, 'tasks');

        const unsubscribe = onValue(tasksRef, (snapshot) => {
            const tasksData = snapshot.val();

            if (tasksData) {
                // Create new data structure from Firebase data
                const newBoardData = {
                    ...boardData,
                    tasks: {},
                    columns: {
                        'todo': {
                            id: 'todo',
                            title: 'To Do',
                            taskIds: []
                        },
                        'in-progress': {
                            id: 'in-progress',
                            title: 'In Progress',
                            taskIds: []
                        },
                        'done': {
                            id: 'done',
                            title: 'Done',
                            taskIds: []
                        }
                    }
                };

                // Process each task and organize by status
                Object.entries(tasksData).forEach(([taskId, taskData]) => {
                    // Add task to tasks object
                    newBoardData.tasks[taskId] = {
                        id: taskId,
                        content: taskData.title,
                        ...taskData
                    };

                    // Add task ID to the appropriate column
                    const status = taskData.status || 'todo'; // Default to todo if no status

                    // Map Firebase status to column IDs if needed
                    let columnId = status;
                    if (status === 'inProgress' || status === 'in_progress') {
                        columnId = 'in-progress';
                    }

                    // Make sure the column exists
                    if (newBoardData.columns[columnId]) {
                        newBoardData.columns[columnId].taskIds.push(taskId);
                    } else {
                        // If column doesn't exist, add to todo as fallback
                        newBoardData.columns['todo'].taskIds.push(taskId);
                    }
                });

                setBoardData(newBoardData);
            }

            setLoading(false);
        });

        // Cleanup function
        return () => unsubscribe();
    }, []);

    // Update task status in Firebase when dragged between columns
    const updateTaskStatus = (taskId, newStatus) => {
        const taskRef = ref(database, `tasks/${taskId}`);
        update(taskRef, { status: newStatus });
    };

    // Delete task from Firebase and local state
    const deleteTask = (taskId, columnId) => {
        // Remove from Firebase
        const taskRef = ref(database, `tasks/${taskId}`);
        remove(taskRef)
            .then(() => {
                // Update local state
                const column = boardData.columns[columnId];
                const newTaskIds = column.taskIds.filter(id => id !== taskId);

                const newBoardData = {
                    ...boardData,
                    columns: {
                        ...boardData.columns,
                        [columnId]: {
                            ...column,
                            taskIds: newTaskIds
                        }
                    },
                    tasks: { ...boardData.tasks }
                };

                // Remove the task from tasks object
                delete newBoardData.tasks[taskId];

                setBoardData(newBoardData);
            })
            .catch((error) => {
                console.error("Error removing task: ", error);
            });
    };

    const handleDragEnd = (result) => {
        const { source, destination, type, draggableId } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Handle column reordering
        if (type === 'column') {
            const newColumnOrder = Array.from(boardData.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, result.draggableId);

            setBoardData({
                ...boardData,
                columnOrder: newColumnOrder
            });
            return;
        }

        // Handle task reordering
        const startColumn = boardData.columns[source.droppableId];
        const endColumn = boardData.columns[destination.droppableId];

        if (startColumn === endColumn) {
            // Moving within the same column
            const newTaskIds = Array.from(startColumn.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...startColumn,
                taskIds: newTaskIds
            };

            setBoardData({
                ...boardData,
                columns: {
                    ...boardData.columns,
                    [newColumn.id]: newColumn
                }
            });
        } else {
            // Moving between columns
            const startTaskIds = Array.from(startColumn.taskIds);
            startTaskIds.splice(source.index, 1);
            const newStartColumn = {
                ...startColumn,
                taskIds: startTaskIds
            };

            const endTaskIds = Array.from(endColumn.taskIds);
            endTaskIds.splice(destination.index, 0, draggableId);
            const newEndColumn = {
                ...endColumn,
                taskIds: endTaskIds
            };

            // Update the state
            setBoardData({
                ...boardData,
                columns: {
                    ...boardData.columns,
                    [newStartColumn.id]: newStartColumn,
                    [newEndColumn.id]: newEndColumn
                }
            });

            // Update the status in Firebase
            updateTaskStatus(draggableId, destination.droppableId);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#848DF9]"></div>
        </div>;
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd} className="relative m-0">
            <Droppable droppableId="board" type="column" direction="horizontal">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex h-full w-full gap-4"
                    >
                        {boardData.columnOrder.map((columnId, index) => {
                            const column = boardData.columns[columnId];
                            const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]);

                            return (
                                <Draggable
                                    key={column.id}
                                    draggableId={column.id}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex-1 h-auto"
                                        >
                                            <div
                                                className={`bg-[#020222] rounded-lg p-4 ${snapshot.isDragging ? 'ring-2 ring-[#848DF9]' : ''
                                                    }`}
                                            >
                                                <div
                                                    {...provided.dragHandleProps}
                                                    className="text-xl font-semibold mb-6 text-white cursor-grab flex justify-between items-center"
                                                >
                                                    {column.title}
                                                    <div className='flex justify-end items-end'>
                                                        <div className='w-7 h-7 rounded-full bg-[#fff] flex justify-center items-center text-[#000] mr-[5px]'>
                                                            {tasks.length}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Droppable droppableId={column.id} type="task">
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={`h-auto  transition-colors ${snapshot.isDraggingOver ? 'bg-opacity-50 bg-[#848DF9]' : ''
                                                                }`}
                                                        >
                                                            {tasks.map((task, index) => (
                                                                <Draggable
                                                                    key={task.id}
                                                                    draggableId={task.id}
                                                                    index={index}
                                                                >
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`bg-[#020222] border-[#848DF9] border-2 p-4 mb-6 rounded-[8px]  flex  justify-between items-start
                                                                                transition-all text-white h-[100px]
                                                                                ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[#848DF9]' : 'shadow-sm'}`}
                                                                        >
                                                                            {task.title || task.content}
                                                                            <button
                                                                                className='pt-1'
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation(); // Prevent drag event
                                                                                    deleteTask(task.id, column.id);
                                                                                }}
                                                                            >
                                                                                <img src='/cancel.svg' className='w-3 h-3 cursor-pointer' />
                                                                            </button>
                                                                        </div>

                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}

                                                            <div className='flex justify-end items-end'>
                                                                <button className='w-10 h-10 rounded-full bg-[#848DF9] flex justify-center items-center cursor-pointer' onClick={() => props.setOpenAddTask(true)}>
                                                                    <img src='/plus.svg' alt="Add task" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default TrackBoard;