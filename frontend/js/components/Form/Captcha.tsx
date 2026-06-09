import * as React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Turnstile } from '@marsidev/react-turnstile'
import config from '~/config'
import uuid from '@shared/utils/uuid'
import CaptchetatCaptcha from './CaptchetatCaptcha'
import { useSelector } from 'react-redux'
import type { GlobalState } from '~/types'

/**
 * Allow Google ReCaptcha to work in test mode
 * see https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
 */
const CAPTCHA_TEST_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
const CAPTCHA_PROD_KEY = '6LfKLxsTAAAAANGSsNIlspDarsFFK53b4bKiBYKC'
const HAS_FILLED_CAPTCHA_STORAGE_KEY = 'hasFilledCaptcha'

const markCaptchaAsFilled = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(HAS_FILLED_CAPTCHA_STORAGE_KEY, JSON.stringify(true))
  }
}

type Props = {
  onChange: (captcha: string) => void
  style?: Record<string, any>
  disabled?: boolean
  captchaRef?: React.Ref<any>
}

const Captcha = ({ onChange, style, disabled = false, captchaRef }: Props) => {
  const captcha = React.useRef(null)
  const captchetat = useSelector((state: GlobalState) => !!state.default.features.captchetat)
  const turnstile_captcha = useSelector((state: GlobalState) => !!state.default.features.turnstile_captcha)

  if (disabled) {
    return null
  }

  if (captchetat) {
    return (
      <CaptchetatCaptcha
        ref={captchaRef}
        onChange={captcha => {
          if (captcha) {
            markCaptchaAsFilled()
          }
          onChange(captcha)
        }}
        style={style}
      />
    )
  }

  if (turnstile_captcha) {
    const turnstilePublicKey =
      typeof window !== 'undefined' && config.canUseDOM
        ? (window as Window & { TURNSTILE_PUBLIC_KEY?: string }).TURNSTILE_PUBLIC_KEY
        : undefined

    if (!turnstilePublicKey) {
      console.warn('[TURNSTILE_PUBLIC_KEY] must be defined to use a captcha !')
      return null
    }

    const siteKey = config.isTest ? '1x00000000000000000000AA' : turnstilePublicKey
    return (
      <Turnstile
        ref={captchaRef}
        siteKey={siteKey}
        id={`turnstile_captcha-${uuid()}`}
        style={{
          transform: 'scale(0.85)',
          transformOrigin: '0 0',
          ...style,
        }}
        onSuccess={token => {
          onChange(token)
        }}
        options={{
          theme: 'light',
        }}
        onError={() => onChange('')}
      />
    )
  }

  return (
    <ReCAPTCHA
      id="recaptcha"
      ref={captcha}
      style={{
        transform: 'scale(0.85)',
        transformOrigin: '0 0',
        ...style,
      }}
      sitekey={config.isTest ? CAPTCHA_TEST_KEY : CAPTCHA_PROD_KEY}
      onChange={captcha => {
        onChange(captcha)
      }}
    />
  )
}

export default Captcha
