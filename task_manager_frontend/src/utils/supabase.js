import { createClient } from '@supabase/supabase-js'
import { getURL } from './getURL'

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
  },
})

// Authentication helper functions
export const authService = {
  /**
   * Sign up with email and password
   */
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getURL()}auth/callback`,
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Reset password for email
   */
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getURL()}auth/reset-password`,
    })
    return { data, error }
  },

  /**
   * Update password
   */
  async updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    })
    return { data, error }
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  /**
   * Sign in with magic link
   */
  async signInWithMagicLink(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getURL()}auth/callback`,
      },
    })
    return { data, error }
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    })
    return { data, error }
  },
}

// Database helper functions
export const dbService = {
  /**
   * Get tasks for current user
   */
  async getTasks(filters = {}) {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters.due_date_from) {
      query = query.gte('due_date', filters.due_date_from)
    }
    if (filters.due_date_to) {
      query = query.lte('due_date', filters.due_date_to)
    }

    // Apply pagination
    const page = filters.page || 1
    const per_page = filters.per_page || 10
    const from = (page - 1) * per_page
    const to = from + per_page - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    return {
      data: data || [],
      error,
      total: count,
      page,
      per_page,
    }
  },

  /**
   * Create new task
   */
  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          ...taskData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    return { data: data ? data[0] : null, error }
  },

  /**
   * Update task
   */
  async updateTask(taskId, taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...taskData,
        updated_at: new Date().toISOString(),
        ...(taskData.status === 'completed' && {
          completed_at: new Date().toISOString(),
        }),
        ...(taskData.status === 'pending' && {
          completed_at: null,
        }),
      })
      .eq('id', taskId)
      .select()

    return { data: data ? data[0] : null, error }
  },

  /**
   * Delete task
   */
  async deleteTask(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    return { error }
  },

  /**
   * Mark task as completed
   */
  async markTaskComplete(taskId) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()

    return { data: data ? data[0] : null, error }
  },

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    return { data, error }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId)
      .select()

    return { data: data ? data[0] : null, error }
  },
}

export default supabase
