import * as React from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Turnstile } from '@marsidev/react-turnstile'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import uuid from '@shared/utils/uuid'
import getBaseUrl from '../utils/getBaseUrl'
import { Controller, useFormContext } from 'react-hook-form'
import { Box, CapUIFontSize } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement)
const isTest = getBaseUrl() === 'https://capco.test'

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
}

const CaptchaSwitch = React.forwardRef<React.Ref<any>, Props>(({ onChange, style, disabled = false }, ref) => {
  const captcha = React.useRef(null)
  const turnstile_captcha = useFeatureFlag('turnstile_captcha')

  if (disabled) {
    return null
  }

  if (turnstile_captcha) {
    // @ts-ignore TURNSTILE_PUBLIC_KEY not on DOM by default
    if (typeof window === 'undefined' || !canUseDOM || !window.TURNSTILE_PUBLIC_KEY) {
      console.warn('[TURNSTILE_PUBLIC_KEY] must be defined to use a captcha !')
      return null
    }
    // @ts-ignore TURNSTILE_PUBLIC_KEY not on DOM by default
    const siteKey = window.TURNSTILE_PUBLIC_KEY
    return (
      <Turnstile
        // @ts-ignore wait for React19 for better ref handling
        ref={ref}
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
      sitekey={isTest ? CAPTCHA_TEST_KEY : CAPTCHA_PROD_KEY}
      onChange={onChange}
    />
  )
})

export const Captcha = React.forwardRef<any, { name: string; required?: boolean }>(({ name, required }, ref) => {
  const { control } = useFormContext()
  const intl = useIntl()
  return (
    <Controller
      name={name}
      rules={{ required }}
      control={control}
      render={({ field, fieldState }) => {
        const { onChange } = field

        return (
          <>
            <CaptchaSwitch onChange={onChange} ref={ref} />
            {fieldState.invalid ? (
              <Box color="red.500" lineHeight="normal" fontSize={CapUIFontSize.BodyRegular}>
                {intl.formatMessage({ id: 'registration.constraints.captcha.invalid' })}
              </Box>
            ) : null}
          </>
        )
      }}
    />
  )
})
Captcha.displayName = 'Captcha'

export default Captcha
