import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setError(error.message)
          return
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          navigate('/dashboard', { replace: true })
        } else {
          // No session found, redirect to login
          navigate('/login', { replace: true })
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        setError('An unexpected error occurred during authentication')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Processing authentication...</h2>
          <p>Please wait while we complete your sign-in.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4F8EF7',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default AuthCallback
