import { useEffect, useState } from "react";
import { useDrag, useDrop } from 'react-dnd';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { STATUSES, STATUS_CONFIG } from '../constants';


const filterTasksByStatus = (tasks, status) => tasks.filter((t) => t.status === status);

function ListTask({ tasks, setTasks }) {
    const [todos, setTodos] = useState(filterTasksByStatus(tasks, 'todo'));
    const [inProgress, setInProgress] = useState(filterTasksByStatus(tasks, 'progress'));
    const [done, setDone] = useState(filterTasksByStatus(tasks, 'done'));

    useEffect(() => {
        setTodos(filterTasksByStatus(tasks, 'todo'));
        setInProgress(filterTasksByStatus(tasks, 'progress'));
        setDone(filterTasksByStatus(tasks, 'done'));
    }, [tasks]);

    return (
        <div className="flex gap-16 md:gap-8 flex-wrap justify-center">
            {STATUSES.map((status, index) => (
                <Section
                    key={index}
                    status={status}
                    tasks={tasks}
                    setTasks={setTasks}
                    todos={todos}
                    inProgress={inProgress}
                    done={done}
                />
            ))}
        </div>
    );
}

function Section({ status, tasks, setTasks, todos, inProgress, done }) {
    const { text, bg } = STATUS_CONFIG[status];
    const tasksToMap = { todo: todos, progress: inProgress, done: done }[status];

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "task",
        drop: (item) => {
            setTasks((prev) => {
                const list = prev.map((task) => (task.id === item.id ? { ...task, status } : task));
                localStorage.setItem('tasks', JSON.stringify(list));
                return list;
            });
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver()
        })
    }));

    return (
        <div ref={drop} className={`w-64 rounded-md mt-2 ${isOver ? 'bg-slate-200' : ""}`}>
            <Header text={text} bg={bg} count={tasksToMap.length} />
            {tasksToMap.map((task, index) => (
                <Task key={index} task={task} setTasks={setTasks} />
            ))}
        </div>
    );
}

function Header({ text, bg, count }) {
    return (
        <div className={`${bg} flex items-center h-12 pl-4 rounded-md uppercase text-sm text-white`}>
            {text}{" "}
            <div className="ml-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-black">
                {count}
            </div>
        </div>
    );
}

function Task({ task, setTasks }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "task",
        item: { id: task.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging()
        })
    }));

    const [isEditing, setIsEditing] = useState(false);
    const [editedTaskName, setEditedTaskName] = useState(task.name);


    const handleDelete = () => {
        let conf = confirm('Are you sure you want to delete this task?');
        if (conf) {
            setTasks((prev) => {
                const list = prev.filter((t) => t.id !== task.id);
                localStorage.setItem('tasks', JSON.stringify(list));
                toast('Task deleted successfully', { icon: <i className="fa-solid fa-bomb text-red-900 font-bold" />, className: "font-bold" });
                return list;
            });
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        setTasks((prev) => {
            const updatedList = prev.map((t) => (t.id === task.id ? { ...t, name: editedTaskName } : t));
            localStorage.setItem('tasks', JSON.stringify(updatedList));
            toast('Task updated successfully', { icon: <i className="fa-solid fa-bomb text-green-900 font-bold" />, className: "font-bold" });

            return updatedList;
        });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedTaskName(task.name);
    };

    return (
        <div ref={drag} className={`relative flex items-center bg-zinc-200 p-4 mt-8 shadow-md rounded-lg cursor-grab ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
            {isEditing ? (
                <>
                    <input
                        type="text"
                        value={editedTaskName}
                        onChange={(e) => setEditedTaskName(e.target.value)}
                    />
                    <i className="fas fa-check ml-auto text-green-500 cursor-pointer" onClick={handleSaveEdit}></i>
                    <i className="fas fa-times ml-4 text-red-500 cursor-pointer" onClick={handleCancelEdit}></i>
                </>
            ) : (
                <>
                    <p className="text-sm">{task.name}</p>
                    <i className="fas fa-trash ml-auto text-red-500 cursor-pointer" onClick={handleDelete}></i>
                    <i className="fas fa-edit ml-4 text-blue-500 cursor-pointer" onClick={handleEdit}></i>
                </>
            )}
        </div>
    );
}

ListTask.propTypes = {
    tasks: PropTypes.array.isRequired,
    setTasks: PropTypes.func.isRequired,
};

Section.propTypes = {
    status: PropTypes.string.isRequired,
    tasks: PropTypes.array.isRequired,
    setTasks: PropTypes.func.isRequired,
    todos: PropTypes.array.isRequired,
    inProgress: PropTypes.array.isRequired,
    done: PropTypes.array.isRequired,
};
Header.propTypes = {
    text: PropTypes.string.isRequired,
    bg: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
};
Task.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
    }).isRequired,
    setTasks: PropTypes.func.isRequired,
};

export default ListTask;
