/**
 * Utility function to get the site URL from environment variables
 * Allows easy switching between development and production environments
 */

export const getURL = () => {
  let url = process.env.REACT_APP_SITE_URL || 'http://localhost:3000'

  // Ensure URL starts with http/https
  if (!url.startsWith('http')) {
    url = `https://${url}`
  }

  // Ensure URL ends with /
  if (!url.endsWith('/')) {
    url = `${url}/`
  }

  return url
}

/**
 * Get the base URL without trailing slash
 */
export const getBaseURL = () => {
  const url = getURL()
  return url.endsWith('/') ? url.slice(0, -1) : url
}

/**
 * Generate authentication callback URL
 */
export const getAuthCallbackURL = () => {
  return `${getURL()}auth/callback`
}

/**
 * Generate password reset URL
 */
export const getPasswordResetURL = () => {
  return `${getURL()}auth/reset-password`
}
