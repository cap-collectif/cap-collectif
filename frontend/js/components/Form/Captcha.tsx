import * as React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Turnstile } from '@marsidev/react-turnstile'
import config from '~/config'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import uuid from '@shared/utils/uuid'

/**
 * Allow Google ReCaptcha to work in test mode
 * see https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
 */
const CAPTCHA_TEST_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
const CAPTCHA_PROD_KEY = '6LfKLxsTAAAAANGSsNIlspDarsFFK53b4bKiBYKC'
type Props = {
  onChange: (captcha: string) => void
  style?: Record<string, any>
  disabled?: boolean
  captchaRef?: React.Ref<any>
}

const Captcha = ({ onChange, style, disabled = false, captchaRef }: Props) => {
  const captcha = React.useRef(null)
  const turnstile_captcha = useFeatureFlag('turnstile_captcha')

  if (disabled) {
    return null
  }

  if (turnstile_captcha) {
    if (typeof window === 'undefined' || !config.canUseDOM || !window.TURNSTILE_PUBLIC_KEY) {
      console.warn('[TURNSTILE_PUBLIC_KEY] must be defined to use a captcha !')
      return null
    }

    const siteKey = config.isTest ? '1x00000000000000000000AA' : window.TURNSTILE_PUBLIC_KEY
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
      onChange={onChange}
    />
  )
}

export default Captcha
