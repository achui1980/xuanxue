import { ref } from 'vue'

export function useNotifications() {
  const isSupported = 'Notification' in window
  const permission = ref(isSupported ? Notification.permission : 'denied')

  const requestPermission = async () => {
    if (!isSupported) return 'denied'
    
    try {
      const result = await Notification.requestPermission()
      permission.value = result
      return result
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }

  const sendNotification = (title, options = {}) => {
    if (!isSupported || permission.value !== 'granted') return

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico', // Assuming a favicon exists or use a default
        badge: '/favicon.ico',
        ...options
      })

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000)

      return notification
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification
  }
}
