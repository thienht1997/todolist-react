import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export default function CreateTask({ tasks, setTasks }) {
    const [task, setTask] = useState({
        name: '',
        id: '',
        status: 'todo',
    });

    const handleChange = (e) => {
        setTask({ ...task, name: e.target.value, id: uuidv4() });
    };

    const showMessage = (message, isError = false) => {
        if (isError) {
            toast.error(message, { icon: <i className="fa-solid fa-bomb text-red-900 font-bold" />, className: "font-bold" });
        }
        else {
            toast.error(message, { icon: <i className="fa-solid fa-party-horn text-green-900 font-bold" />, className: "font-bold"});
        }
    };

    const validateTask = () => {

        if (!task.name) {
          showMessage('Task name is required', true);
          return false;
        };

        if (tasks.some((t) => t.name === task.name)) {
          showMessage('Task already exists', true);
          return false;
        };

        const nameLength = task.name.length;
        if (nameLength < 3 || nameLength > 20) {
          showMessage('Task name must be between 3 and 20 characters', true);
          return false;
        };

        return true;
      };


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateTask()) {
            return;
        }

        setTasks((prev) => {
            const list = [...prev, task];
            localStorage.setItem('tasks', JSON.stringify(list));
            return list;
        });

        setTask({
            name: '',
            id: '',
            status: 'todo',
        });

        showMessage('Task created successfully');
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    className="border-2 border-slate-400 bg-slate-100 rounded-md mr-4 h-12 w-64 px-1"
                    onChange={handleChange}
                    type="text"
                    value={task.name}
                />
                <button className="bg-indigo-500 rounded-md px-4 h-12 text-white" type="submit">Create</button>
            </form>
        </>
    );
}
