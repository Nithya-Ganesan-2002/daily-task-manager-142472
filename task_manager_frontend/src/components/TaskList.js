import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';
import './TaskList.css';

// PUBLIC_INTERFACE
const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1,
    per_page: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 10
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks(filters);
      setTasks(response.tasks);
      setPagination({
        total: response.total,
        page: response.page,
        per_page: response.per_page
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleCreateTask = async (taskData) => {
    try {
      await taskService.createTask(taskData);
      setShowTaskForm(false);
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await taskService.updateTask(taskId, taskData);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchTasks();
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task');
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.markComplete(taskId);
      fetchTasks();
    } catch (err) {
      console.error('Error completing task:', err);
      setError('Failed to complete task');
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.per_page);

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h1>My Tasks</h1>
        <button 
          className="create-task-button"
          onClick={() => setShowTaskForm(true)}
        >
          + New Task
        </button>
      </div>

      <TaskFilters onFilterChange={handleFilterChange} />

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <>
          <div className="tasks-grid">
            {tasks.length === 0 ? (
              <div className="no-tasks">
                <h3>No tasks found</h3>
                <p>Create your first task to get started!</p>
              </div>
            ) : (
              tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={(task) => setEditingTask(task)}
                  onDelete={handleDeleteTask}
                  onComplete={handleCompleteTask}
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="pagination-button"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {totalPages} 
                ({pagination.total} total tasks)
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? 
            (data) => handleUpdateTask(editingTask.id, data) : 
            handleCreateTask
          }
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskList;
