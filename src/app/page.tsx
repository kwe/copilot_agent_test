'use client';

import { useState, useEffect } from 'react';

interface Todo {
  id: number;
  content: string;
  completed: boolean;
  createdAt: number;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const response = await fetch('/api/todos');
    const data = await response.json();
    setTodos(data);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newTodo }),
    });
    setNewTodo('');
    fetchTodos();
  };

  const toggleTodo = async (id: number, completed: boolean) => {
    await fetch('/api/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed }),
    });
    fetchTodos();
  };

  const deleteTodo = async (id: number) => {
    setRemovingId(id);
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await fetch('/api/todos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchTodos();
    setRemovingId(null);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-blue-900 dark:text-blue-500">Todo List</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {todos.filter(todo => !todo.completed).length} items remaining
        </p>
        
        <form onSubmit={addTodo} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </form>

        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 transition-all duration-300 ${
                removingId === todo.id ? 'opacity-0 transform -translate-x-full' : 'opacity-100'
              }`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className={
                todo.completed 
                  ? 'line-through text-green-600 dark:text-green-400 flex-1' 
                  : 'flex-1 dark:text-white'
              }>
                {todo.content}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
