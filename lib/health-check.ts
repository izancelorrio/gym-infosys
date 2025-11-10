import { API_CONFIG } from './config'

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const isBrowser = typeof window !== 'undefined'
    const targetUrl = isBrowser
      ? '/api/health'
      : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`

    const options: RequestInit = {
      cache: 'no-store',
      ...(isBrowser ? {} : { headers: API_CONFIG.HEADERS }),
    }

    const response = await fetch(targetUrl, options)
    
    if (!response.ok) {
      console.error('[API Health Check] Failed with status:', response.status)
      return false
    }

    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    console.error('[API Health Check] Connection error:', error)
    return false
  }
}