import { useEffect } from 'react'

export function usePwaInstall() {
  useEffect(() => {
    const handler = (event) => {
      event.preventDefault()
      window.__deferredInstallPrompt = event
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])
}

export async function promptPwaInstall() {
  const prompt = window.__deferredInstallPrompt

  if (!prompt) return false

  prompt.prompt()

  const { outcome } = await prompt.userChoice
  window.__deferredInstallPrompt = null

  return outcome === 'accepted'
}
