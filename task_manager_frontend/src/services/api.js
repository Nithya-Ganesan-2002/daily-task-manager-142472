import { dbService, supabase } from '../utils/supabase';

// Helper function to handle auth errors
const handleAuthError = (error) => {
  if (error.message?.includes('JWT') || error.message?.includes('auth')) {
    // Redirect to login on auth errors
    window.location.href = '/login';
  }
  throw error;
};

// Helper function to format task data
const formatTaskData = (task) => {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    due_date: task.due_date,
    user_id: task.user_id,
    created_at: task.created_at,
    updated_at: task.updated_at,
    completed_at: task.completed_at,
  };
};

// PUBLIC_INTERFACE
export const authService = {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }
};

// PUBLIC_INTERFACE
export const taskService = {
  async getTasks(filters = {}) {
    try {
      const result = await dbService.getTasks(filters);
      
      if (result.error) {
        handleAuthError(result.error);
      }

      return {
        tasks: result.data.map(formatTaskData),
        total: result.total,
        page: result.page,
        per_page: result.per_page,
      };
    } catch (error) {
      console.error('Get tasks error:', error);
      handleAuthError(error);
    }
  },

  async getTask(taskId) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        handleAuthError(error);
      }

      return formatTaskData(data);
    } catch (error) {
      console.error('Get task error:', error);
      handleAuthError(error);
    }
  },

  async createTask(taskData) {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const result = await dbService.createTask({
        ...taskData,
        user_id: user.id,
      });

      if (result.error) {
        handleAuthError(result.error);
      }

      return formatTaskData(result.data);
    } catch (error) {
      console.error('Create task error:', error);
      handleAuthError(error);
    }
  },

  async updateTask(taskId, taskData) {
    try {
      const result = await dbService.updateTask(taskId, taskData);

      if (result.error) {
        handleAuthError(result.error);
      }

      return formatTaskData(result.data);
    } catch (error) {
      console.error('Update task error:', error);
      handleAuthError(error);
    }
  },

  async deleteTask(taskId) {
    try {
      const result = await dbService.deleteTask(taskId);

      if (result.error) {
        handleAuthError(result.error);
      }

      return { success: true };
    } catch (error) {
      console.error('Delete task error:', error);
      handleAuthError(error);
    }
  },

  async markComplete(taskId) {
    try {
      const result = await dbService.markTaskComplete(taskId);

      if (result.error) {
        handleAuthError(result.error);
      }

      return formatTaskData(result.data);
    } catch (error) {
      console.error('Mark complete error:', error);
      handleAuthError(error);
    }
  }
};

// For backward compatibility, also export the supabase client
export default supabase;
