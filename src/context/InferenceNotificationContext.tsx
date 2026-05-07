import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { io, type Socket } from 'socket.io-client'
import type { InferenceJobStatus } from '@/types/types'

type Notification = {
  blueprintName: string
  blueprintPath: string
}

type InferenceNotificationContextType = {
  notification: Notification | null
  startTracking: (jobId: string, blueprintName: string, blueprintPath: string) => void
  clearNotification: () => void
}

const InferenceNotificationContext = createContext<InferenceNotificationContextType>({
  notification: null,
  startTracking: () => {},
  clearNotification: () => {},
})

export function InferenceNotificationProvider({ children }: { children: React.ReactNode }) {
  const { getAccessTokenSilently } = useAuth0()
  const [notification, setNotification] = useState<Notification | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const clearNotification = useCallback(() => setNotification(null), [])

  const startTracking = useCallback(async (jobId: string, blueprintName: string, blueprintPath: string) => {
    socketRef.current?.disconnect()
    socketRef.current = null

    try {
      const token = await getAccessTokenSilently()
      const socket = io(`${import.meta.env.VITE_API_URL}/inference`, {
        auth: { token: `Bearer ${token}` },
        transports: ['websocket'],
      })
      socketRef.current = socket

      const TIMEOUT_MS = 6 * 60 * 1000
      const timer = setTimeout(() => {
        socket.disconnect()
        socketRef.current = null
      }, TIMEOUT_MS)

      socket.on('connect', () => socket.emit('subscribe', jobId))

      socket.on('inference:update', (data: { status: InferenceJobStatus }) => {
        if (data.status === 'Processed' || data.status === 'Error' || data.status === 'Cancelled') {
          clearTimeout(timer)
          socket.disconnect()
          socketRef.current = null
          if (window.location.pathname !== blueprintPath) {
            setNotification({ blueprintName, blueprintPath })
          }
        }
      })

      socket.on('connect_error', () => {
        clearTimeout(timer)
        socket.disconnect()
        socketRef.current = null
      })
    } catch {
      // token fetch failed — silent, no notification
    }
  }, [getAccessTokenSilently])

  return (
    <InferenceNotificationContext.Provider value={{ notification, startTracking, clearNotification }}>
      {children}
    </InferenceNotificationContext.Provider>
  )
}

export const useInferenceNotification = () => useContext(InferenceNotificationContext)
