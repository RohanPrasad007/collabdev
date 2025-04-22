"use client";
import React, { useState } from "react";
import { database } from "../firebase"; // Assuming this is your Firebase file path
import { ref, push } from "firebase/database";

const AddTodoCard = (props) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [status, setStatus] = useState("todo"); // Default to 'todo'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get trackId from props
  const { trackId } = props;

  // Handle task submission
  const handleSubmit = async () => {
    // Validate input
    if (!taskTitle.trim()) {
      alert("Please enter a task title");
      return;
    }

    // Validate that we have a trackId
    if (!trackId) {
      alert("No track selected");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create task object
      const newTask = {
        title: taskTitle,
        status: status,
        createdAt: new Date().toISOString(),
        trackId: trackId, // Store the trackId with the task for reference
      };

      // Reference to the tasks collection under the specific track in Firebase
      const tasksRef = ref(database, `tracks/${trackId}/tasks`);

      // Push new task to Firebase under the track
      await push(tasksRef, newTask);

      // Reset form
      setTaskTitle("");
      setStatus("todo");

      // Close modal if provided
      props.setOpenAddTask(false);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map status values to readable names for the radio buttons
  const statusOptions = {
    todo: {
      id: "job-1",
      label: "Todo",
      description: "A new task to be completed",
    },
    "in-progress": {
      id: "job-2",
      label: "In Progress",
      description: "A task that is currently being worked on",
    },
    done: {
      id: "job-3",
      label: "Done",
      description: "A task that has been completed",
    },
  };

  return (
    <>
      <div className="h-full w-full">
        <div
          tabIndex="-1"
          className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex"
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative rounded-lg shadow-sm bg-[#020222]">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                <h3 className="text-[24px] font-semibold text-[#E2E2FE] ">
                  Add a Task
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => props.setOpenAddTask(false)}
                >
                  <svg
                    className="w-3 h-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 md:p-5">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  <input
                    type="text"
                    className="w-full p-5 rounded-lg bg-[#0A0A3A] text-white border-[#848DF9] border-[1px] focus:outline-none"
                    placeholder="Enter a task here..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </p>
                <ul className="space-y-4 mb-4">
                  {Object.entries(statusOptions).map(([value, option]) => (
                    <li key={option.id}>
                      <input
                        type="radio"
                        id={option.id}
                        name="status"
                        value={value}
                        className="hidden peer"
                        checked={status === value}
                        onChange={() => setStatus(value)}
                        required
                      />
                      <label
                        htmlFor={option.id}
                        className="inline-flex items-center justify-between w-full p-5 text-gray-900 bg-[#0A0A3A] border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 peer-checked:border-[#848DF9] peer-checked:text-[#848DF9] hover:text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-500"
                      >
                        <div className="block">
                          <div className="w-full text-lg font-semibold">
                            {option.label}
                          </div>
                          <div className="w-full text-gray-500 dark:text-gray-400">
                            {option.description}
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 ms-3 rtl:rotate-180 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9"
                          />
                        </svg>
                      </label>
                    </li>
                  ))}
                </ul>
                <button
                  className={`text-white inline-flex w-full justify-center bg-[#848DF9] focus:outline-none rounded-lg text-sm px-5 py-2.5 text-center font-bold text-[14px] ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTodoCard;
