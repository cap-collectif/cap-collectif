import * as React from 'react'

export const MAX_DURATION = 180
export const MIN_DURATION = 10
export const ALERT_BEFORE_END = 30
const LIVE_LEVELS_COUNT = 40
const TICK_MS = 100

export type MicErrorKind = 'denied' | 'absent' | 'busy' | 'unsupported' | 'other'

export class MicError extends Error {
  kind: MicErrorKind

  constructor(kind: MicErrorKind) {
    super(`Microphone unavailable: ${kind}`)
    this.kind = kind
  }
}

export type Recording = {
  blob: Blob
  duration: number
  // Every microphone level sampled during the recording, used to draw the waveform
  levels: number[]
  autoStopped: boolean
  // A too short recording is only paused: the participant can resume it with continueRecording
  canContinue: boolean
}

type Callbacks = {
  onRecorded: (recording: Recording) => void
  onAlert: () => void
  onAutoStop: () => void
}

const MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4',
  'audio/ogg;codecs=opus',
]

export const isRecordingSupported = (): boolean =>
  typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof window.MediaRecorder !== 'undefined'

const pickMimeType = (): string =>
  MIME_TYPES.find(type => {
    try {
      return MediaRecorder.isTypeSupported(type)
    } catch {
      return false
    }
  }) ?? ''

export const getMicErrorKind = (error: unknown): MicErrorKind => {
  const name = (error as { name?: string } | null)?.name
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'denied'
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || name === 'OverconstrainedError') return 'absent'
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') return 'busy'
  if (name === 'Unsupported') return 'unsupported'
  return 'other'
}

/**
 * Records the microphone with MediaRecorder: live duration and level, pause/resume,
 * automatic stop after MAX_DURATION seconds.
 * Stopping before MIN_DURATION seconds pauses the recorder instead, so that the participant can continue it:
 * a stopped MediaRecorder cannot be restarted, and two recordings cannot simply be concatenated.
 */
const useVocalRecorder = (callbacks: Callbacks) => {
  const [elapsed, setElapsed] = React.useState(0)
  const [liveLevels, setLiveLevels] = React.useState<number[]>([])
  const [isPaused, setIsPaused] = React.useState(false)

  const callbacksRef = React.useRef(callbacks)
  callbacksRef.current = callbacks

  const session = React.useRef({
    stream: null as MediaStream | null,
    recorder: null as MediaRecorder | null,
    chunks: [] as Blob[],
    audioContext: null as AudioContext | null,
    analyser: null as AnalyserNode | null,
    buffer: null as Uint8Array | null,
    tick: 0,
    accumulated: 0,
    startedAt: 0,
    paused: false,
    levels: [] as number[],
    autoStopped: false,
    alerted: false,
    duration: 0,
    snapshotRequested: false,
  })

  const getElapsed = React.useCallback((): number => {
    const s = session.current
    return s.accumulated + (s.paused || !s.startedAt ? 0 : (performance.now() - s.startedAt) / 1000)
  }, [])

  const releaseMicrophone = React.useCallback(() => {
    const s = session.current
    window.clearInterval(s.tick)
    s.tick = 0
    s.stream?.getTracks().forEach(track => track.stop())
    s.stream = null
    s.audioContext?.close().catch(() => {})
    s.audioContext = null
    s.analyser = null
  }, [])

  const readLevel = (): number => {
    const { analyser, buffer } = session.current
    if (!analyser || !buffer) return 0.15 + Math.random() * 0.2
    analyser.getByteTimeDomainData(buffer)
    let sum = 0
    for (let i = 0; i < buffer.length; i++) {
      const v = (buffer[i] - 128) / 128
      sum += v * v
    }
    return Math.min(1, Math.sqrt(sum / buffer.length) * 4)
  }

  const stop = React.useCallback(
    (auto = false) => {
      const s = session.current
      if (!s.recorder) return
      s.duration = Math.min(getElapsed(), MAX_DURATION)
      if (!auto && s.duration < MIN_DURATION && s.recorder.state === 'paused') {
        // Already paused by the participant: only request the partial recording
        s.snapshotRequested = true
        s.recorder.requestData()
        return
      }
      if (!auto && s.duration < MIN_DURATION && s.recorder.state === 'recording') {
        // The onpause handler requests the recorded data, then onRecorded receives a playable partial recording
        s.snapshotRequested = true
        s.recorder.pause()
        s.accumulated = s.duration
        s.paused = true
        setIsPaused(true)
        return
      }
      window.clearInterval(s.tick)
      s.tick = 0
      s.autoStopped = auto
      if (auto) callbacksRef.current.onAutoStop()
      if (s.recorder.state !== 'inactive') s.recorder.stop()
    },
    [getElapsed],
  )

  const tick = React.useCallback(() => {
    const s = session.current
    if (s.paused) return
    const current = getElapsed()
    s.levels.push(readLevel())
    setElapsed(Math.min(current, MAX_DURATION))
    setLiveLevels(s.levels.slice(-LIVE_LEVELS_COUNT))
    if (!s.alerted && MAX_DURATION - current <= ALERT_BEFORE_END) {
      s.alerted = true
      callbacksRef.current.onAlert()
    }
    if (current >= MAX_DURATION) stop(true)
  }, [getElapsed, stop])

  const cancel = React.useCallback(() => {
    const s = session.current
    const { recorder } = s
    // Detaching the recorder first makes its late events ignored (see ondataavailable and onstop)
    s.recorder = null
    releaseMicrophone()
    if (recorder && recorder.state !== 'inactive') recorder.stop()
  }, [releaseMicrophone])

  /** Rejects with a MicError when the microphone cannot be used. */
  const start = React.useCallback(async (): Promise<void> => {
    cancel()
    if (!isRecordingSupported()) throw new MicError('unsupported')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
    } catch (error) {
      throw new MicError(getMicErrorKind(error))
    }

    const s = session.current
    const mimeType = pickMimeType()
    let recorder: MediaRecorder
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    } catch {
      recorder = new MediaRecorder(stream)
    }
    Object.assign(s, {
      stream,
      recorder,
      chunks: [],
      levels: [],
      autoStopped: false,
      alerted: false,
      accumulated: 0,
      paused: false,
      snapshotRequested: false,
    })
    recorder.ondataavailable = event => {
      if (s.recorder !== recorder) return
      if (event.data?.size) s.chunks.push(event.data)
      if (!s.snapshotRequested || recorder.state !== 'paused') return
      s.snapshotRequested = false
      // The chunks recorded so far form a valid prefix of the final file
      callbacksRef.current.onRecorded({
        blob: new Blob(s.chunks, { type: recorder.mimeType || mimeType || 'audio/webm' }),
        duration: s.duration,
        levels: s.levels.slice(),
        autoStopped: false,
        canContinue: true,
      })
    }
    // Requested from the pause event, so that the data event comes after every chunk recorded before the pause
    recorder.onpause = () => {
      if (s.recorder === recorder && s.snapshotRequested) recorder.requestData()
    }
    recorder.onstop = () => {
      // A cancelled recorder fires asynchronously, possibly once a new session has started
      if (s.recorder !== recorder) return
      releaseMicrophone()
      const blob = new Blob(s.chunks, { type: recorder.mimeType || mimeType || 'audio/webm' })
      s.chunks = []
      s.recorder = null
      callbacksRef.current.onRecorded({
        blob,
        duration: s.duration,
        levels: s.levels,
        autoStopped: s.autoStopped,
        canContinue: false,
      })
    }
    recorder.start(1000)
    s.startedAt = performance.now()

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      s.audioContext = new AudioContextClass()
      const source = s.audioContext.createMediaStreamSource(stream)
      s.analyser = s.audioContext.createAnalyser()
      s.analyser.fftSize = 1024
      source.connect(s.analyser)
      s.buffer = new Uint8Array(s.analyser.fftSize)
    } catch {
      // The level meter falls back to random values
      s.analyser = null
    }

    setElapsed(0)
    setLiveLevels([])
    setIsPaused(false)
    s.tick = window.setInterval(tick, TICK_MS)
  }, [cancel, releaseMicrophone, tick])

  const pause = React.useCallback(() => {
    const s = session.current
    if (!s.recorder || s.recorder.state !== 'recording' || s.paused) return
    s.recorder.pause()
    s.accumulated = getElapsed()
    s.paused = true
    setIsPaused(true)
  }, [getElapsed])

  const resume = React.useCallback(() => {
    const s = session.current
    if (!s.recorder || !s.paused) return
    s.snapshotRequested = false
    s.recorder.resume()
    s.startedAt = performance.now()
    s.paused = false
    setIsPaused(false)
  }, [])

  const isRecording = React.useCallback(() => !!session.current.recorder, [])

  React.useEffect(() => cancel, [cancel])

  return { start, stop, pause, resume, cancel, isRecording, elapsed, liveLevels, isPaused }
}

export default useVocalRecorder
