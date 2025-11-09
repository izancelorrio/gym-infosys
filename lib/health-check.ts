import { API_CONFIG } from './config'

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`, {
      headers: API_CONFIG.HEADERS,
    })
    
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