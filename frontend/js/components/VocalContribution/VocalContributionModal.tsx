import { Box, useTheme } from '@cap-collectif/ui'
import CookieMonster from '@shared/utils/CookieMonster'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay'
import { buildToastUrl } from '~/components/ParticipationWorkflow/utils/buildToastUrl'
import type { GlobalState } from '~/types'
import type { VocalContributionModalQuery } from '~relay/VocalContributionModalQuery.graphql'
import useVocalRecorder, {
  ALERT_BEFORE_END,
  MAX_DURATION,
  MIN_DURATION,
  MicError,
  MicErrorKind,
  Recording,
} from './useVocalRecorder'
import { OPEN_HASH, TRIGGER_SELECTOR, formatClock } from './utils'
import type { VocalIconName } from './VocalContribution.icons'
import { TRAME_LINES, TRAME_VIEWBOX } from './VocalContribution.icons'
import { getVocalContributionStyles } from './VocalContribution.style'
import type { UploadConfig } from './vocalContributionApi'
import { VocalContributionError, addVocalContribution, uploadVocalFile } from './vocalContributionApi'
import VocalContributionPlayer, { PlayerHandle } from './VocalContributionPlayer'
import VocalIcon from './VocalIcon'

const QUERY = graphql`
  query VocalContributionModalQuery {
    vocalContributionStep {
      id
      url
    }
  }
`

type Screen = 'intro' | 'rec' | 'review' | 'redo' | 'quit' | 'micro'

const RING_CIRCUMFERENCE = 2 * Math.PI * 100
const LIVE_BARS_COUNT = 40
const CLOSE_DELAY_MS = 250
const MAX_MINUTES = MAX_DURATION / 60

// Every tip is rendered with a unique id (vocal-tip-<name>), so that an instance can hide the unwanted ones
// in its custom code without a platform change, for example: #vocal-tip-calm { display: none; }
const TIPS: Array<{ icon: VocalIconName; name: string }> = [
  { icon: 'leaf', name: 'calm' },
  { icon: 'idea', name: 'structure' },
  { icon: 'mic', name: 'naturally' },
  { icon: 'shield', name: 'no-personal-data' },
  { icon: 'again', name: 'replay' },
]

const getSubmitErrorKey = (error: unknown): string => {
  switch (error instanceof VocalContributionError ? error.code : 'UNKNOWN') {
    case 'VOCAL_CONTRIBUTION_NOT_CONFIGURED':
    case 'VOCAL_CONTRIBUTION_DISABLED':
      return 'front.vocal-contribution.error.unavailable'
    case 'RATE_LIMIT_REACHED':
      return 'front.vocal-contribution.error.too-many-requests'
    case 'INVALID_VOICE_MESSAGE':
    case 'INVALID_VOICE_DURATION':
      return 'front.vocal-contribution.error.invalid-file'
    default:
      return 'front.vocal-contribution.submit-error'
  }
}

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const bold = (...chunks: React.ReactNode[]) => <b>{chunks}</b>

type ButtonProps = {
  kind: 'primary' | 'secondary' | 'quiet'
  label: string
  onClick: () => void
  icon?: VocalIconName
  iconAfter?: VocalIconName
  disabled?: boolean
  busy?: boolean
  busyLabel?: string
}

const ActionButton = ({ kind, label, onClick, icon, iconAfter, disabled, busy, busyLabel }: ButtonProps) => (
  <button
    type="button"
    className={`gcv-btn gcv-btn--${kind}${busy ? ' is-busy' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {icon && <VocalIcon name={icon} size={22} />}
    <span className="gcv-spin" aria-hidden="true" />
    <span>{busy && busyLabel ? busyLabel : label}</span>
    {iconAfter && <VocalIcon name={iconAfter} size={22} />}
  </button>
)

type View = {
  icon?: VocalIconName
  tone?: 'info' | 'warn'
  title: string
  lede?: React.ReactNode
  stage?: React.ReactNode
  primary?: React.ReactNode
  secondary?: React.ReactNode
  small?: string
}

/**
 * Full-screen modal to record a vocal contribution, opened by any element matching TRIGGER_SELECTOR
 * (the "Dicter ma solution" button of the homepage custom section) or by the #dicter hash.
 * The contributions go to the collect step flagged with isVocalContributionEnabled.
 */
type Props = {
  uploadConfig: UploadConfig
  onParticipationWorkflowRequired: (
    stepId: string,
    contributionId: string,
    shouldTriggerConsentInternalCommunication: boolean,
  ) => void
}

const VocalContributionModal = ({ uploadConfig, onParticipationWorkflowRequired }: Props) => {
  const intl = useIntl()
  const isAuthenticated = useSelector((state: GlobalState) => state.user.user) !== null
  const theme = useTheme()
  const environment = useRelayEnvironment()

  const [isOpen, setIsOpen] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [screen, setScreen] = React.useState<Screen>('intro')
  const [screenKey, setScreenKey] = React.useState(0)
  const [recording, setRecording] = React.useState<Recording | null>(null)
  const [micError, setMicError] = React.useState<MicErrorKind>('other')
  const [submitError, setSubmitError] = React.useState('')
  const [isStarting, setIsStarting] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState('')
  const [step, setStep] = React.useState<{ id: string; url: string } | null>(null)

  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const titleRef = React.useRef<HTMLHeadingElement | null>(null)
  const errorRef = React.useRef<HTMLParagraphElement | null>(null)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const playerRef = React.useRef<PlayerHandle | null>(null)
  const screenRef = React.useRef<Screen>('intro')
  const backRef = React.useRef<Screen>('intro')
  const recordingRef = React.useRef<Recording | null>(null)
  const isOpenRef = React.useRef(false)
  const inertedRef = React.useRef<Element[]>([])

  const maxDurationText = intl.formatMessage({ id: 'front.vocal-contribution.max-duration' }, { minutes: MAX_MINUTES })

  const announce = React.useCallback((text: string) => {
    setAnnouncement('')
    window.setTimeout(() => setAnnouncement(text), 60)
  }, [])

  // keepFocus re-renders the current screen without moving the focus nor replaying its entrance
  const show = React.useCallback((next: Screen, keepFocus = false) => {
    screenRef.current = next
    setScreen(next)
    if (!keepFocus) setScreenKey(key => key + 1)
  }, [])

  const replaceRecording = React.useCallback((next: Recording | null) => {
    recordingRef.current = next
    setRecording(next)
  }, [])

  const stopAudio = React.useCallback(() => playerRef.current?.pause(), [])

  const recorder = useVocalRecorder({
    onRecorded: result => {
      replaceRecording(result)
      if (screenRef.current === 'rec' || screenRef.current === 'quit') show('review')
    },
    onAlert: () =>
      announce(intl.formatMessage({ id: 'front.vocal-contribution.alert' }, { seconds: ALERT_BEFORE_END })),
    onAutoStop: () =>
      announce(intl.formatMessage({ id: 'front.vocal-contribution.auto-stopped' }, { duration: maxDurationText })),
  })

  const isPending = () => recorder.isRecording() || !!recordingRef.current

  const resetRecording = React.useCallback(() => {
    stopAudio()
    recorder.cancel()
    replaceRecording(null)
    setSubmitError('')
  }, [recorder, replaceRecording, stopAudio])

  const setInert = React.useCallback((on: boolean) => {
    if (on) {
      inertedRef.current = Array.from(document.body.children).filter(
        el => el !== rootRef.current && !el.hasAttribute('inert') && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE',
      )
      inertedRef.current.forEach(el => {
        el.setAttribute('inert', '')
        el.setAttribute('aria-hidden', 'true')
      })
    } else {
      inertedRef.current.forEach(el => {
        el.removeAttribute('inert')
        el.removeAttribute('aria-hidden')
      })
      inertedRef.current = []
    }
  }, [])

  const open = React.useCallback(
    (trigger: HTMLElement | null) => {
      if (isOpenRef.current) return
      triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null)
      isOpenRef.current = true
      setIsOpen(true)
      show(recordingRef.current ? 'review' : 'intro')
    },
    [show],
  )

  const close = React.useCallback(() => {
    if (!isOpenRef.current) return
    isOpenRef.current = false
    if (isPending()) resetRecording()
    else stopAudio()
    setIsVisible(false)
    setInert(false)
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    window.setTimeout(() => setIsOpen(false), prefersReducedMotion() ? 0 : CLOSE_DELAY_MS)
    if (window.location.hash === OPEN_HASH)
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    const trigger = triggerRef.current
    if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true })
    triggerRef.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetRecording, setInert, stopAudio])

  const requestClose = () => {
    if (screenRef.current === 'quit' || isSending) return
    if (isPending()) {
      backRef.current = screenRef.current === 'redo' ? 'review' : screenRef.current
      stopAudio()
      recorder.pause()
      show('quit')
    } else close()
  }

  const startRecording = async () => {
    setIsStarting(true)
    stopAudio()
    replaceRecording(null)
    setSubmitError('')
    try {
      await recorder.start()
      if (!isOpenRef.current) {
        recorder.cancel()
        return
      }
      show('rec')
      announce(intl.formatMessage({ id: 'front.vocal-contribution.started' }, { duration: maxDurationText }))
    } catch (error) {
      setMicError(error instanceof MicError ? error.kind : 'other')
      show('micro')
    } finally {
      setIsStarting(false)
    }
  }

  // A too short recording is only paused: recording again adds to it
  const continueRecording = () => {
    stopAudio()
    replaceRecording(null)
    show('rec')
    recorder.resume()
  }

  const validate = async () => {
    const { current } = recordingRef
    if (isSending || !current) return
    stopAudio()
    setIsSending(true)
    setSubmitError('')
    try {
      // Unknown visitors get a participant from the upload route, then the mutation confirms its token
      const cookieToken = isAuthenticated ? null : CookieMonster.getParticipantCookie() ?? null
      const upload = await uploadVocalFile(current.blob, uploadConfig, cookieToken)
      const payload = await addVocalContribution(
        upload.vocalId,
        isAuthenticated ? null : upload.participantToken ?? cookieToken,
      )
      if (!isAuthenticated && payload.participantToken) CookieMonster.addParticipantCookie(payload.participantToken)
      setIsSending(false)
      resetRecording()
      close()
      // Same rule as the replies: the workflow also asks for the optional internal communication consent
      const needsWorkflow =
        payload.shouldTriggerParticipationWorkflow || payload.shouldTriggerConsentInternalCommunication
      if (needsWorkflow && step) {
        onParticipationWorkflowRequired(
          step.id,
          payload.contributionId,
          payload.shouldTriggerConsentInternalCommunication,
        )
      }
      // Same destination as the end of the participation workflow
      else window.location.href = buildToastUrl('/', { variant: 'success', message: 'your-participation-is-confirmed' })
    } catch (error) {
      // The message shown to the participant is generic: keep the actual cause for debugging
      console.error('Vocal contribution submission failed', error)
      setIsSending(false)
      setSubmitError(intl.formatMessage({ id: getSubmitErrorKey(error) }))
      show('review', true)
    }
  }
  // Opening: lock the page behind the modal, then fade in
  React.useEffect(() => {
    if (!isOpen) return
    setInert(true)
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    const frame = window.requestAnimationFrame(() => setIsVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [isOpen, setInert])

  // Each new screen moves the focus to its title
  React.useEffect(() => {
    if (isOpen) titleRef.current?.focus({ preventScroll: true })
  }, [isOpen, screenKey])

  React.useEffect(() => {
    if (submitError) errorRef.current?.focus()
  }, [submitError])

  // Triggers: the homepage button, any link to #dicter, or the hash itself
  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const trigger = target?.closest?.(TRIGGER_SELECTOR) as HTMLElement | null
      if (!trigger || rootRef.current?.contains(trigger)) return
      event.preventDefault()
      event.stopPropagation()
      open(trigger)
    }
    const fromHash = () => {
      if (window.location.hash === OPEN_HASH) open(null)
    }
    document.addEventListener('click', onClick, true)
    window.addEventListener('hashchange', fromHash)
    fromHash()
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('hashchange', fromHash)
    }
  }, [open])

  // Warn before leaving the page while a recording is not submitted
  React.useEffect(() => {
    if (!isOpen || (!recording && screen !== 'rec')) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isOpen, recording, screen])

  // The collect step receiving the contributions: needed for the participation workflow and the written alternative
  React.useEffect(() => {
    if (!isOpen) return
    const subscription = fetchQuery<VocalContributionModalQuery>(environment, QUERY, {}).subscribe({
      next: data => setStep(data.vocalContributionStep ?? null),
      error: () => setStep(null),
    })
    return () => subscription.unsubscribe()
  }, [environment, isOpen])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (screenRef.current === 'quit') stay()
      else requestClose()
      return
    }
    if (event.key !== 'Tab' || !rootRef.current) return
    const focusables = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])'),
    ).filter(
      el => !(el as HTMLButtonElement).disabled && !el.closest('[aria-hidden="true"]') && el.offsetParent !== null,
    )
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && (document.activeElement === first || !rootRef.current.contains(document.activeElement))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const stay = () => {
    const back = backRef.current || 'intro'
    show(back)
    if (back === 'rec') recorder.resume()
  }

  if (!isOpen) return null

  const getView = (): View => {
    switch (screen) {
      case 'rec': {
        const elapsed = Math.min(recorder.elapsed, MAX_DURATION)
        const isLate = MAX_DURATION - elapsed <= ALERT_BEFORE_END
        const live = recorder.liveLevels
        return {
          title: intl.formatMessage({ id: 'front.vocal-contribution.rec.title' }),
          lede: intl.formatMessage({ id: 'front.vocal-contribution.rec.lede' }),
          stage: (
            <div className="gcv__rec">
              <div className={`gcv__ring${isLate ? ' is-late' : ''}`}>
                <svg viewBox="0 0 212 212" aria-hidden="true">
                  <circle className="gcv-track" cx="106" cy="106" r="100" />
                  <circle
                    className="gcv-prog"
                    cx="106"
                    cy="106"
                    r="100"
                    strokeDasharray={RING_CIRCUMFERENCE.toFixed(1)}
                    strokeDashoffset={(RING_CIRCUMFERENCE * (1 - elapsed / MAX_DURATION)).toFixed(1)}
                  />
                </svg>
                <div
                  className="gcv__clock"
                  role="timer"
                  aria-label={intl.formatMessage({ id: 'front.vocal-contribution.rec.timer' })}
                >
                  <span className="gcv__time">{formatClock(elapsed)}</span>
                  <span className="gcv__max">
                    {intl.formatMessage({ id: 'front.vocal-contribution.rec.max' }, { max: formatClock(MAX_DURATION) })}
                  </span>
                </div>
              </div>
              <div className="gcv__live">
                <p className={`gcv__status${recorder.isPaused ? ' is-paused' : ''}`}>
                  <span className="gcv__dot" aria-hidden="true" />
                  <span>
                    {recorder.isPaused
                      ? intl.formatMessage({ id: 'front.vocal-contribution.rec.paused' })
                      : isLate
                      ? intl.formatMessage(
                          { id: 'front.vocal-contribution.rec.late' },
                          {
                            remaining: formatClock(Math.ceil(MAX_DURATION - elapsed)),
                          },
                        )
                      : intl.formatMessage({ id: 'front.vocal-contribution.rec.recording' })}
                  </span>
                </p>
                <div className="gcv__level" aria-hidden="true">
                  {Array.from({ length: LIVE_BARS_COUNT }, (_, i) => {
                    const level = live[live.length - LIVE_BARS_COUNT + i] ?? 0
                    return (
                      <i key={i} style={{ transform: `scaleY(${Math.max(0.06, Math.min(1, level)).toFixed(3)})` }} />
                    )
                  })}
                </div>
              </div>
            </div>
          ),
          primary: (
            <ActionButton
              kind="primary"
              icon="stop"
              label={intl.formatMessage({ id: 'front.vocal-contribution.rec.stop' })}
              onClick={() => recorder.stop()}
            />
          ),
          secondary: (
            <>
              {recorder.isPaused ? (
                <ActionButton
                  kind="secondary"
                  icon="record"
                  label={intl.formatMessage({ id: 'front.vocal-contribution.rec.resume' })}
                  onClick={recorder.resume}
                />
              ) : (
                <ActionButton
                  kind="secondary"
                  icon="pause"
                  label={intl.formatMessage({ id: 'front.vocal-contribution.rec.pause' })}
                  onClick={recorder.pause}
                />
              )}
              <ActionButton kind="quiet" label={intl.formatMessage({ id: 'global.cancel' })} onClick={requestClose} />
            </>
          ),
        }
      }
      case 'review': {
        if (!recording) return { title: '' }
        const isTooShort = recording.duration < MIN_DURATION
        return {
          title: intl.formatMessage({ id: 'front.vocal-contribution.review.title' }),
          lede: intl.formatMessage({ id: 'front.vocal-contribution.review.lede' }),
          stage: (
            <>
              <VocalContributionPlayer recording={recording} playerRef={playerRef} />
              {recording.autoStopped && (
                <p className="gcv__note">
                  <VocalIcon name="clock" size={22} />
                  <span>
                    {intl.formatMessage(
                      { id: 'front.vocal-contribution.review.auto-stopped' },
                      { duration: maxDurationText },
                    )}
                  </span>
                </p>
              )}
              {isTooShort && (
                <p className="gcv__note gcv__note--error">
                  <VocalIcon name="warn" size={22} />
                  <span>
                    {intl.formatMessage({ id: 'front.vocal-contribution.review.too-short' }, { seconds: MIN_DURATION })}
                  </span>
                </p>
              )}
              {submitError && (
                <p className="gcv__note gcv__note--error" role="alert" tabIndex={-1} ref={errorRef}>
                  <VocalIcon name="warn" size={22} />
                  <span>{submitError}</span>
                </p>
              )}
            </>
          ),
          primary:
            isTooShort && recording.canContinue ? (
              <ActionButton
                kind="primary"
                icon="mic"
                label={intl.formatMessage({ id: 'front.vocal-contribution.review.continue' })}
                onClick={continueRecording}
              />
            ) : (
              <ActionButton
                kind="primary"
                iconAfter="arrow"
                label={intl.formatMessage({ id: 'front.vocal-contribution.review.validate' })}
                busy={isSending}
                busyLabel={intl.formatMessage({ id: 'front.vocal-contribution.review.sending' })}
                disabled={isTooShort}
                onClick={validate}
              />
            ),
          secondary: (
            <ActionButton
              kind="secondary"
              icon="again"
              label={intl.formatMessage({ id: 'front.vocal-contribution.review.restart' })}
              busy={isTooShort && isStarting}
              busyLabel={intl.formatMessage({ id: 'front.vocal-contribution.opening-mic' })}
              // An unusable recording is not worth a confirmation
              onClick={() => {
                stopAudio()
                if (isTooShort) startRecording()
                else show('redo')
              }}
            />
          ),
        }
      }
      case 'redo':
        return {
          icon: 'again',
          title: intl.formatMessage({ id: 'front.vocal-contribution.redo.title' }),
          lede: intl.formatMessage({ id: 'front.vocal-contribution.redo.lede' }),
          primary: (
            <ActionButton
              kind="primary"
              label={intl.formatMessage({ id: 'front.vocal-contribution.redo.confirm' })}
              busy={isStarting}
              busyLabel={intl.formatMessage({ id: 'front.vocal-contribution.opening-mic' })}
              onClick={startRecording}
            />
          ),
          secondary: (
            <ActionButton
              kind="quiet"
              label={intl.formatMessage({ id: 'front.vocal-contribution.redo.keep' })}
              onClick={() => show('review')}
            />
          ),
        }
      case 'quit': {
        const wasRecording = backRef.current === 'rec'
        return {
          icon: 'warn',
          tone: 'warn',
          title: intl.formatMessage({ id: 'front.vocal-contribution.quit.title' }),
          lede: `${
            wasRecording ? `${intl.formatMessage({ id: 'front.vocal-contribution.quit.paused' })} ` : ''
          }${intl.formatMessage({
            id: 'front.vocal-contribution.quit.lede',
          })}`,
          primary: (
            <ActionButton
              kind="primary"
              label={intl.formatMessage({
                id: wasRecording ? 'front.vocal-contribution.quit.resume' : 'front.vocal-contribution.quit.back',
              })}
              onClick={stay}
            />
          ),
          secondary: (
            <ActionButton
              kind="quiet"
              label={intl.formatMessage({ id: 'front.vocal-contribution.quit.leave' })}
              onClick={() => {
                resetRecording()
                close()
              }}
            />
          ),
        }
      }
      case 'micro': {
        const canRetry = micError !== 'unsupported'
        return {
          icon: 'micoff',
          tone: 'warn',
          title: intl.formatMessage({ id: `front.vocal-contribution.mic.${micError}.title` }),
          lede: intl.formatMessage({ id: `front.vocal-contribution.mic.${micError}.text` }),
          stage: step ? (
            <a className="gcv__alt" href={step.url}>
              <VocalIcon name="pencil" size={26} />
              <span>{intl.formatMessage({ id: 'front.vocal-contribution.write-instead' }, { b: bold })}</span>
              <VocalIcon name="arrow" size={22} />
            </a>
          ) : null,
          primary: canRetry ? (
            <ActionButton
              kind="primary"
              label={intl.formatMessage({ id: 'front.vocal-contribution.mic.retry' })}
              busy={isStarting}
              busyLabel={intl.formatMessage({ id: 'front.vocal-contribution.opening-mic' })}
              onClick={startRecording}
            />
          ) : null,
          secondary: (
            <ActionButton
              kind={canRetry ? 'quiet' : 'primary'}
              label={intl.formatMessage({ id: 'global.close' })}
              onClick={close}
            />
          ),
        }
      }
      case 'intro':
      default:
        return {
          title: intl.formatMessage({ id: 'front.vocal-contribution.intro.title' }),
          lede: intl.formatMessage({ id: 'front.vocal-contribution.intro.lede' }, { duration: maxDurationText }),
          stage: (
            <ul className="gcv__tips" aria-label={intl.formatMessage({ id: 'front.vocal-contribution.tips.title' })}>
              {TIPS.map(tip => (
                <li key={tip.name} id={`vocal-tip-${tip.name}`}>
                  <VocalIcon name={tip.icon} size={24} />
                  <span>{intl.formatMessage({ id: `front.vocal-contribution.tips.${tip.name}` }, { b: bold })}</span>
                </li>
              ))}
            </ul>
          ),
          primary: (
            <ActionButton
              kind="primary"
              icon="mic"
              label={intl.formatMessage({ id: 'front.vocal-contribution.intro.start' })}
              busy={isStarting}
              busyLabel={intl.formatMessage({ id: 'front.vocal-contribution.opening-mic' })}
              onClick={startRecording}
            />
          ),
          small: intl.formatMessage({ id: 'front.vocal-contribution.intro.mic-permission' }),
        }
    }
  }

  const view = getView()
  const brand = intl.formatMessage({ id: 'front.vocal-contribution.brand' })

  return createPortal(
    <Box
      ref={rootRef}
      id="vocal-contribution"
      className={isVisible ? 'gcv-is-open' : undefined}
      data-screen={screen}
      onKeyDown={onKeyDown}
      sx={getVocalContributionStyles(theme.colors)}
    >
      <div className="gcv__shell" role="dialog" aria-modal="true" aria-labelledby="gcv-title">
        <aside className="gcv__aside" aria-hidden="true">
          <p className="gcv__brand">
            <VocalIcon name="mic" size={20} />
            <span>{brand}</span>
          </p>
          <p className="gcv__aside-title">
            {intl.formatMessage({ id: 'front.vocal-contribution.aside-title' }, { br: <br /> })}
          </p>
          <div className="gcv__trame">
            <svg aria-hidden="true" focusable="false" viewBox={TRAME_VIEWBOX}>
              {TRAME_LINES.map((line, i) => (
                <line
                  key={i}
                  className={line.hot ? 'gcv-tr gcv-tr--hot' : 'gcv-tr'}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  pathLength={1}
                  style={{ '--i': i } as React.CSSProperties}
                />
              ))}
            </svg>
          </div>
        </aside>
        <div className="gcv__main">
          <div className="gcv__top">
            <p className="gcv__eyebrow">
              <VocalIcon name="mic" size={18} />
              <span>{brand}</span>
            </p>
            <button
              type="button"
              className="gcv__close"
              aria-label={intl.formatMessage({ id: 'global.close' })}
              onClick={requestClose}
            >
              <VocalIcon name="x" size={26} />
            </button>
          </div>
          <div className="gcv__body">
            <div key={screenKey} className="gcv__inner gcv-enter">
              <div className="gcv__head">
                {view.icon && (
                  <span className={`gcv__mark gcv__mark--${view.tone || 'info'}`}>
                    <VocalIcon name={view.icon} size={40} />
                  </span>
                )}
                <h2 className="gcv__title" id="gcv-title" tabIndex={-1} ref={titleRef}>
                  {view.title}
                </h2>
                {view.lede && <p className="gcv__lede">{view.lede}</p>}
              </div>
              <div className="gcv__stage">{view.stage}</div>
              <div className="gcv__actions">
                {view.primary}
                {view.secondary}
              </div>
              <div className="gcv__after">{view.small && <p className="gcv__small">{view.small}</p>}</div>
            </div>
          </div>
          <p className="gcv-sr" aria-live="polite">
            {announcement}
          </p>
        </div>
      </div>
    </Box>,
    document.body,
  )
}

export default VocalContributionModal
