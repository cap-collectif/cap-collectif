import { Box, CapUIFontSize, Flex, Input } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'
import config from '~/config'

const CAPTCHETAT_STYLE = 'captchaFR'
const CAPTCHETAT_MIN_CODE_LENGTH = 6
const CAPTCHETAT_MAX_CODE_LENGTH = 8
const AUTO_VALIDATE_DELAY = 400

type Props = {
  onChange: (captcha: string) => void
  style?: Record<string, any>
  disabled?: boolean
}

type CaptchetatData = {
  imageb64: string
  uuid: string
}

type ValidationStatus = 'idle' | 'processed'

const isValidCodeLength = (code: string) =>
  code.length >= CAPTCHETAT_MIN_CODE_LENGTH && code.length <= CAPTCHETAT_MAX_CODE_LENGTH

type CaptchetatValidationResponse = {
  success?: boolean
}

const CaptchetatCaptcha = React.forwardRef<HTMLInputElement, Props>(({ onChange, style, disabled = false }, ref) => {
  const [data, setData] = React.useState<CaptchetatData | null>(null)
  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [validationStatus, setValidationStatus] = React.useState<ValidationStatus>('idle')
  const intl = useIntl()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()

  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  // @ts-expect-error CAPTCHETAT_BACKEND_URL is injected on window at runtime
  const backendUrl: string | undefined = config.canUseDOM ? window.CAPTCHETAT_BACKEND_URL : undefined

  const fetchImage = React.useCallback(async () => {
    if (!backendUrl) {
      setError('registration.constraints.captcha.invalid')
      return
    }

    try {
      setError(null)
      const response = await fetch(`${backendUrl}?get=image&c=${CAPTCHETAT_STYLE}`)

      if (!response.ok) {
        const body = await response.text().catch(() => '(unreadable)')
        console.error(`[CAPTCHETAT] Failed to fetch captcha image: HTTP ${response.status} from ${response.url}`, body)
        setError('registration.constraints.captcha.invalid')
        return
      }

      const payload: CaptchetatData = await response.json()
      setData(payload)
      setCode('')
      setValidationStatus('idle')
      onChange('')
    } catch (exception) {
      console.error(`[CAPTCHETAT] Failed to fetch captcha image from ${backendUrl}:`, exception)
      setError('registration.constraints.captcha.invalid')
    }
  }, [backendUrl, onChange])

  const playSound = React.useCallback(async () => {
    if (!backendUrl || !data) {
      return
    }

    try {
      await new Audio(`${backendUrl}?get=sound&c=${CAPTCHETAT_STYLE}&t=${data.uuid}`).play()
    } catch {
      setError('registration.constraints.captcha.invalid')
      await fetchImage()
    }
  }, [backendUrl, data, fetchImage])

  React.useEffect(() => {
    // CaptchaChecker always returns true in test environment.
    if (config.isTest) {
      onChange(JSON.stringify({ uuid: 'test', code: 'test' }))
      return
    }

    fetchImage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCodeChange = (value: string) => {
    const trimmedValue = value.trim()

    setCode(value)
    setValidationStatus('idle')
    onChange('')
    setError(trimmedValue.length > 0 && !isValidCodeLength(trimmedValue) ? 'captchetat.input.length.error' : null)
  }

  const handleSubmit = React.useCallback(async () => {
    if (!data || !isValidCodeLength(code.trim())) {
      setError('captchetat.input.length.error')
      onChange('')
      return
    }

    setValidationStatus('processed')

    try {
      const response = await fetch(backendUrl ?? '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid: data.uuid, code: code.trim() }),
      })
      const payload: CaptchetatValidationResponse = await response.json()

      if (!response.ok || !payload.success) {
        setError('registration.constraints.captcha.invalid')
        onChange('')
        return
      }

      setError(null)
      onChange(JSON.stringify({ uuid: data.uuid, code: code.trim() }))
    } catch (exception) {
      console.error(`[CAPTCHETAT] Failed to validate captcha from ${backendUrl}:`, exception)
      setError('registration.constraints.captcha.invalid')
      onChange('')
    }
  }, [backendUrl, code, data, onChange])

  React.useEffect(() => {
    if (validationStatus !== 'idle' || !data || !isValidCodeLength(code.trim())) {
      return
    }

    const timeout = window.setTimeout(handleSubmit, AUTO_VALIDATE_DELAY)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [code, data, handleSubmit, validationStatus])

  if (disabled || config.isTest) {
    return null
  }

  if (!backendUrl) {
    return (
      <Box color="red.700" lineHeight="normal" fontSize={CapUIFontSize.BodyRegular} role="alert">
        {intl.formatMessage({ id: 'registration.constraints.captcha.invalid' })}
      </Box>
    )
  }

  return (
    <Box style={style}>
      <>
        <Flex direction="row" align="center" spacing={2} mb={2}>
          {data ? (
            <img src={data.imageb64} alt={intl.formatMessage({ id: 'captchetat.image.alt' })} height={60} />
          ) : null}
          <Flex direction="column" spacing={1}>
            <button
              type="button"
              title={intl.formatMessage({ id: 'captchetat.sound.title' })}
              aria-label={intl.formatMessage({ id: 'captchetat.sound.title' })}
              onClick={playSound}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.0"
                width="25"
                height="25"
                viewBox="0 0 75 75"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
                  style={{ stroke: '#111', strokeWidth: 5, strokeLinejoin: 'round', fill: '#111' }}
                />
                <path
                  d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6"
                  style={{ fill: 'none', stroke: '#111', strokeWidth: 5, strokeLinecap: 'round' }}
                />
              </svg>
            </button>
            <button
              type="button"
              title={intl.formatMessage({ id: 'captchetat.refresh.title' })}
              aria-label={intl.formatMessage({ id: 'captchetat.refresh.title' })}
              onClick={fetchImage}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 17 20"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M9.00003 4.0001C11.1 4.0001 13.1 4.8001 14.6 6.3001C17.7 9.4001 17.7 14.5001 14.6 17.6001C12.8 19.5001 10.3 20.2001 7.90003 19.9001L8.40003 17.9001C10.1 18.1001 11.9 17.5001 13.2 16.2001C15.5 13.9001 15.5 10.1001 13.2 7.7001C12.1 6.6001 10.5 6.0001 9.00003 6.0001V10.6001L4.00003 5.6001L9.00003 0.600098V4.0001ZM3.30003 17.6001C0.700029 15.0001 0.300029 11.0001 2.10003 7.9001L3.60003 9.4001C2.50003 11.6001 2.90003 14.4001 4.80003 16.2001C5.30003 16.7001 5.90003 17.1001 6.60003 17.4001L6.00003 19.4001C5.00003 19.0001 4.10003 18.4001 3.30003 17.6001V17.6001Z"
                  fill="black"
                />
              </svg>
            </button>
          </Flex>
        </Flex>
        <Flex gap="xs" alignItems="center">
          <label
            htmlFor={inputId}
            style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
          >
            {intl.formatMessage({ id: 'captchetat.input.placeholder' })}
          </label>
          <Input
            id={inputId}
            ref={inputRef}
            type="text"
            value={code}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleCodeChange(event.target.value)}
            placeholder={intl.formatMessage({ id: 'captchetat.input.placeholder' })}
            title={intl.formatMessage({ id: 'captchetat.input.placeholder' })}
            autoComplete="off"
          />
        </Flex>
        {error ? (
          <Box color="red.700" lineHeight="normal" fontSize={CapUIFontSize.BodyRegular} role="alert" mt={1}>
            {intl.formatMessage({ id: error })}
          </Box>
        ) : null}
      </>
    </Box>
  )
})

CaptchetatCaptcha.displayName = 'CaptchetatCaptcha'

export default CaptchetatCaptcha
