import { useReducer, useEffect, useState, ReactElement } from "react";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import { FiTrash } from "react-icons/fi";
import "@fontsource/inter";

interface Task {
  id: number;
  name: string;
  done: boolean;
}

interface State {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "FETCH_SUCCESS"; payload: Task[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "TOGGLE_TASK"; payload: number }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "REMOVE_TASK"; payload: number };

const initialState: State = {
  tasks: [],
  loading: true,
  error: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return { ...state, tasks: action.payload, loading: false };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload ? { ...task, done: !task.done } : task
        ),
      };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "REMOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    default:
      return state;
  }
};

function App(): ReactElement {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [newTaskName, setNewTaskName] = useState("");

  const { tasks, error, loading } = state;

  useEffect(() => {
    axios
      .get("http://localhost:3000/tasks")
      .then((response) => {
        dispatch({ type: "FETCH_SUCCESS", payload: response.data });
      })
      .catch((error) => {
        dispatch({ type: "FETCH_ERROR", payload: error.message });
      });
  }, []);

  const handleAddTask = () => {
    if (newTaskName.trim() === "") return; // Avoid adding empty tasks
    const newTask = {
      id: Date.now(),
      name: newTaskName,
      done: false,
    };
    dispatch({ type: "ADD_TASK", payload: newTask });
    setNewTaskName("");
  };

  const handleRemoveTask = (id: number) => {
    dispatch({ type: "REMOVE_TASK", payload: id });
  };

  if (loading) {
    return <p className="text-center text-white">Loading...</p>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-300 p-4">
        <p className="text-center text-red-500 bg-red-100 border border-red-400 rounded-lg py-2 px-4 font-semibold">
          Error: {error}
        </p>
      </div>
    );
  }

  const tasksToDo = tasks.filter((task) => !task.done);
  const doneTasks = tasks.filter((task) => task.done);

  return (
    <div className="bg-[#0D0714] min-h-screen text-white flex justify-center items-center font-inter p-4">
      <div className="bg-[#1D1825] rounded-2xl max-w-lg w-full p-6 flex flex-col space-y-6">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Add a new task"
            className="border border-[#9E78CF] rounded-lg bg-transparent placeholder:text-[#777777] outline-none py-2 px-3 w-full"
          />
          <button
            onClick={handleAddTask}
            className="bg-[#9E78CF] rounded-lg px-3 py-2 flex items-center"
          >
            <AiOutlinePlus className="text-xl text-white" />
          </button>
        </div>

        <div>
          <h2 className="text-white text-xl mb-3">
            Tasks to do - {tasksToDo.length}
          </h2>

          <ul className="text-[#9E78CF] flex flex-col gap-y-4">
            {tasksToDo.map((task) => (
              <li
                key={task.id}
                className="bg-[#15101C] p-4 rounded-lg flex justify-between items-center"
              >
                <span
                  className={`flex-1 ${
                    task.done ? "line-through text-[#78CFB0]" : ""
                  }`}
                >
                  {task.name}
                </span>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      dispatch({ type: "TOGGLE_TASK", payload: task.id })
                    }
                    className="text-[#9E78CF]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-check"
                    >
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                  </button>

                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className="text-red-500"
                  >
                    <FiTrash className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-white text-xl mb-3">Done - {doneTasks.length}</h2>

          <ul className="flex flex-col gap-y-4">
            {doneTasks.map((task) => (
              <li
                key={task.id}
                className="bg-[#15101C] p-4 rounded-lg flex items-center"
              >
                <span className="line-through text-[#78CFB0] flex-1">
                  {task.name}
                </span>
                <button
                  onClick={() => handleRemoveTask(task.id)}
                  className="text-red-500"
                >
                  <FiTrash className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
