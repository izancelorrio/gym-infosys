import { API_CONFIG } from "@/lib/config"

type QueryValue = string | number | boolean | undefined | null

type QueryParams = Record<string, QueryValue>

const normalizePath = (path: string) => {
  if (!path) {
    return "/"
  }
  return path.startsWith("/") ? path : `/${path}`
}

export const buildApiUrl = (path: string, params?: QueryParams) => {
  const url = new URL(normalizePath(path), API_CONFIG.BASE_URL)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  return url.toString()
}

export const withApiHeaders = (extraHeaders?: HeadersInit): HeadersInit => ({
  ...API_CONFIG.HEADERS,
  ...(extraHeaders ?? {}),
})
