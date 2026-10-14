import * as React from 'react'
import { getVoiceMessageFileUrl } from './utils'

export type VoiceMessagePlayer = {
  playingId: string | null
  toggle: (vocalId: string) => void
}

/**
 * Plays one voice message at a time from the list. A plain play/stop is enough here: seeking is not offered,
 * so the missing duration and seek index of MediaRecorder WebM files do not matter.
 */
const useVoiceMessagePlayer = (): VoiceMessagePlayer => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = React.useState<string | null>(null)

  const stop = React.useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.onended = null
    audio.onerror = null
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    audioRef.current = null
    setPlayingId(null)
  }, [])

  const toggle = React.useCallback(
    (vocalId: string) => {
      const isSameVocal = playingId === vocalId
      stop()
      if (isSameVocal) return

      const audio = new Audio(getVoiceMessageFileUrl(vocalId))
      audio.onended = stop
      audio.onerror = stop
      audioRef.current = audio
      setPlayingId(vocalId)
      // play() also rejects when another vocal interrupts it: only stop if this one is still current
      audio.play().catch(() => {
        if (audioRef.current === audio) stop()
      })
    },
    [playingId, stop],
  )

  React.useEffect(() => stop, [stop])

  return { playingId, toggle }
}

export default useVoiceMessagePlayer
