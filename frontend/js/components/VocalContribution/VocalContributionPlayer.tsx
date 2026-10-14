import * as React from 'react'
import { useIntl } from 'react-intl'
import VocalIcon from './VocalIcon'
import type { Recording } from './useVocalRecorder'
import { formatClock } from './utils'

const WAVE_BARS_COUNT = 56
const MIN_WAVE_HEIGHT = 0.08

/** Waveform drawn from the levels sampled while recording, until the audio is decoded. */
export const getWaveHeights = (levels: number[], count = WAVE_BARS_COUNT): number[] =>
  Array.from({ length: count }, (_, i) => {
    if (!levels.length) return 8
    const from = Math.floor((i * levels.length) / count)
    const to = Math.max(from + 1, Math.floor(((i + 1) * levels.length) / count))
    const peak = Math.max(...levels.slice(from, Math.min(to, levels.length)))
    return Math.round(Math.max(MIN_WAVE_HEIGHT, peak) * 100)
  })

/** Waveform drawn from the decoded audio: each bar is the loudness (RMS) of an equal slice of the vocal. */
export const getAudioWaveHeights = (samples: Float32Array, count = WAVE_BARS_COUNT): number[] => {
  const rms = Array.from({ length: count }, (_, i) => {
    const from = Math.floor((i * samples.length) / count)
    const to = Math.floor(((i + 1) * samples.length) / count)
    let sum = 0
    for (let j = from; j < to; j++) sum += samples[j] * samples[j]
    return to > from ? Math.sqrt(sum / (to - from)) : 0
  })
  const max = Math.max(...rms)
  return rms.map(value => Math.round(Math.max(MIN_WAVE_HEIGHT, max ? value / max : 0) * 100))
}

export type PlayerHandle = { pause: () => void }

type Props = {
  recording: Recording
  playerRef: React.MutableRefObject<PlayerHandle | null>
}

/**
 * Plays the recording through the Web Audio API rather than an <audio> element: a WebM produced by
 * MediaRecorder has neither duration nor seek index, so the element seeks to wrong positions.
 * The decoded buffer gives the exact duration, sample-accurate seeking and the waveform.
 */
const VocalContributionPlayer = ({ recording, playerRef }: Props) => {
  const intl = useIntl()
  const [buffer, setBuffer] = React.useState<AudioBuffer | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)

  const playback = React.useRef({
    context: null as AudioContext | null,
    buffer: null as AudioBuffer | null,
    source: null as AudioBufferSourceNode | null,
    // Position in the vocal when the current source started, and context time at that moment
    offset: 0,
    startedAt: 0,
    frame: 0,
  })

  const duration = buffer?.duration ?? recording.duration
  const heights = React.useMemo(
    () => (buffer ? getAudioWaveHeights(buffer.getChannelData(0)) : getWaveHeights(recording.levels)),
    [buffer, recording.levels],
  )

  const getPosition = React.useCallback((): number => {
    const p = playback.current
    if (!p.source || !p.context || !p.buffer) return p.offset
    return Math.min(p.offset + p.context.currentTime - p.startedAt, p.buffer.duration)
  }, [])

  const halt = React.useCallback(() => {
    const p = playback.current
    window.cancelAnimationFrame(p.frame)
    if (!p.source) return
    // Detach onended first: stop() fires it too
    p.source.onended = null
    p.source.stop()
    p.source.disconnect()
    p.source = null
  }, [])

  const pause = React.useCallback(() => {
    const p = playback.current
    if (!p.source) return
    p.offset = getPosition()
    halt()
    setIsPlaying(false)
    setCurrentTime(p.offset)
  }, [getPosition, halt])

  const playFrom = React.useCallback(
    (offset: number) => {
      const p = playback.current
      if (!p.context || !p.buffer) return
      halt()
      // Must run within the click handler for Safari and the autoplay policies
      p.context.resume().catch(() => {})
      const source = p.context.createBufferSource()
      source.buffer = p.buffer
      source.connect(p.context.destination)
      source.onended = () => {
        halt()
        p.offset = 0
        setIsPlaying(false)
        setCurrentTime(0)
      }
      p.offset = offset >= p.buffer.duration ? 0 : offset
      p.startedAt = p.context.currentTime
      source.start(0, p.offset)
      p.source = source
      setIsPlaying(true)
      const follow = () => {
        setCurrentTime(getPosition())
        p.frame = window.requestAnimationFrame(follow)
      }
      follow()
    },
    [getPosition, halt],
  )

  React.useEffect(() => {
    const p = playback.current
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    const context: AudioContext = new AudioContextClass()
    let isCancelled = false
    p.context = context
    p.offset = 0
    setBuffer(null)
    setCurrentTime(0)
    recording.blob
      .arrayBuffer()
      .then(data => context.decodeAudioData(data))
      .then(decoded => {
        if (isCancelled) return
        p.buffer = decoded
        setBuffer(decoded)
      })
      .catch(error => console.error('Vocal contribution decoding failed', error))
    playerRef.current = { pause }
    return () => {
      isCancelled = true
      halt()
      context.close().catch(() => {})
      p.context = null
      p.buffer = null
      setIsPlaying(false)
      if (playerRef.current?.pause === pause) playerRef.current = null
    }
  }, [recording.blob, playerRef, pause, halt])

  const progress = duration ? Math.min(1, currentTime / duration) : 0
  const valueText = intl.formatMessage(
    { id: 'front.vocal-contribution.player.position-value' },
    { current: formatClock(currentTime), total: formatClock(duration) },
  )
  const bars = heights.map((height, i) => <i key={i} style={{ height: `${height}%` }} />)

  const togglePlay = () => {
    if (isPlaying) pause()
    else playFrom(playback.current.offset)
  }

  const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!buffer) return
    const target = (Number(event.target.value) / 1000) * buffer.duration
    if (isPlaying) playFrom(target)
    else {
      playback.current.offset = target
      setCurrentTime(target)
    }
  }

  return (
    <div className="gcv__player">
      <button
        type="button"
        className="gcv__play"
        onClick={togglePlay}
        disabled={!buffer}
        aria-label={intl.formatMessage({
          id: isPlaying ? 'front.vocal-contribution.player.pause' : 'front.vocal-contribution.player.play',
        })}
      >
        <VocalIcon name={isPlaying ? 'pause' : 'play'} />
      </button>
      <div className="gcv__track">
        <div className="gcv__wave">
          <div className="gcv__wave-row">{bars}</div>
          <div className="gcv__wave-on" style={{ '--p': `${(progress * 100).toFixed(2)}%` } as React.CSSProperties}>
            <div className="gcv__wave-row">{bars}</div>
          </div>
          <input
            className="gcv__seek"
            type="range"
            min={0}
            max={1000}
            step={1}
            value={Math.round(progress * 1000)}
            onChange={seek}
            disabled={!buffer}
            aria-label={intl.formatMessage({ id: 'front.vocal-contribution.player.position' })}
            aria-valuetext={valueText}
          />
          <span className="gcv__wave-focus" />
        </div>
        <div className="gcv__times">
          <span>{formatClock(currentTime)}</span>
          <span>{formatClock(duration)}</span>
        </div>
      </div>
    </div>
  )
}

export default VocalContributionPlayer
