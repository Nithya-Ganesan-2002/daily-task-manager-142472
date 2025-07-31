import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/api';
import TaskList from './TaskList';
import AuthForm from './AuthForm';
import './Dashboard.css';

// PUBLIC_INTERFACE
const Dashboard = () => {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1,
    per_page: 10
  });

  const fetchTasks = async () => {
    if (!isAuthenticated) return;
    
    try {
      setTaskLoading(true);
      setError(null);
      const response = await taskService.getTasks(filters);
      setTasks(response.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTaskUpdate = () => {
    // Refresh tasks after any update
    fetchTasks();
  };

  // Show loading spinner during initial authentication check
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthForm onSuccess={fetchTasks} />
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Task Manager</h1>
          <div className="user-info">
            <span>Welcome, {user?.email}</span>
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="dashboard-content">
          <TaskList 
            tasks={tasks}
            loading={taskLoading}
            onTaskUpdate={handleTaskUpdate}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
