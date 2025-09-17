import axios, { AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

/**
 * Create axios request config with JWT token
 */
export const createAuthConfig = (): AxiosRequestConfig => {
  const token = Cookies.get('access_token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}

/**
 * Make authenticated POST request to generate timetable variants
 */
export const generateTimetableVariants = async (setupMode: string, formData: any) => {
  const config = createAuthConfig()
  return await axios.post('http://localhost:8000/api/scheduler/generate-variants/', formData, config)
}

/**
 * Make authenticated POST request to commit a timetable variant
 */
export const commitTimetableVariant = async (variant: any, name: string, institutionId: number = 1) => {
  const config = createAuthConfig()
  return await axios.post('http://localhost:8000/api/scheduler/commit-variant/', {
    variant: variant,
    name: name,
    institution_id: institutionId
  }, config)
}

/**
 * Make authenticated GET request
 */
export const authenticatedGet = async (url: string) => {
  const config = createAuthConfig()
  return await axios.get(url, config)
}

/**
 * Make authenticated POST request
 */
export const authenticatedPost = async (url: string, data: any) => {
  const config = createAuthConfig()
  return await axios.post(url, data, config)
}
