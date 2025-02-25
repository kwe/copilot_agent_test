import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../page';

// Mock the DND context since we don't need to test drag and drop in unit tests
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@dnd-kit/sortable', () => ({
  ...jest.requireActual('@dnd-kit/sortable'),
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
  }),
}));

describe('Todo App', () => {
  it('renders the todo list title', () => {
    render(<Home />);
    expect(screen.getByText('Todo List')).toBeInTheDocument();
  });

  it('adds a new todo', () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Add a new todo...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Test todo' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('toggles todo completion', () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Add a new todo...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Toggle test' } });
    fireEvent.click(addButton);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const todoText = screen.getByText('Toggle test');
    expect(todoText).toHaveClass('line-through');
  });

  it('deletes a todo', () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Add a new todo...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Delete test' } });
    fireEvent.click(addButton);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Wait for the deletion animation
    setTimeout(() => {
      expect(screen.queryByText('Delete test')).not.toBeInTheDocument();
    }, 500);
  });

  it('updates remaining items count', () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Add a new todo...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Count test 1' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: 'Count test 2' } });
    fireEvent.click(addButton);

    expect(screen.getByText('2 items remaining')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    expect(screen.getByText('1 items remaining')).toBeInTheDocument();
  });
});