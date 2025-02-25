'use client';

import { useState, useEffect } from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Todo {
  id: number;
  content: string;
  completed: boolean;
  createdAt: number;
}

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  removingId: boolean;
}

function SortableTodoItem({ todo, onToggle, onDelete, removingId }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 transition-all duration-300 ease-in-out ${
        removingId ? 'opacity-0 transform -translate-x-full scale-95 h-0 m-0 p-0' : 'opacity-100 transform translate-x-0 scale-100'
      }`}
      {...attributes}
    >
      <button 
        className="cursor-grab active:cursor-grabbing px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        {...listeners}
      >
        ⋮⋮
      </button>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(todo.id, e.target.checked)}
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
        onClick={() => onDelete(todo.id)}
        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
      >
        Delete
      </button>
    </li>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo = {
      id: Date.now(),
      content: newTodo.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos(prev => [...prev, todo]);
    setNewTodo('');
  }

  function toggleTodo(id: number, completed: boolean) {
    setTodos(todos => todos.map(todo =>
      todo.id === id ? { ...todo, completed } : todo
    ));
  }

  function deleteTodo(id: number) {
    setRemovingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setTodos(todos => todos.filter(todo => todo.id !== id));
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

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
              className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={todos.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-3">
              {todos.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  removingId={removingIds.has(todo.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}