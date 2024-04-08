import * as React from 'react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { SubmissionError } from 'redux-form'
import Captcha from '~/components/Form/Captcha'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import SubscribeNewsletterMutation from '~/mutations/SubscribeNewsletterMutation'
import { Flex, toast } from '@cap-collectif/ui'

const Input = styled.input`
  width: 250px;
  background-color: #fafafa;
  border-color: #e3e3e3;
  font-size: 14px;
  border-radius: 5px;
  margin-right: 4px;
`

const NewsLetterInput = () => {
  const intl = useIntl()
  const captchaFeature = useFeatureFlag('captcha')
  const [email, setEmail] = React.useState('')
  const [captcha, setCaptcha] = React.useState(null)
  const [captchaEnabled, enableCaptcha] = React.useState(false)
  const [formCaptchaError, setFormCaptchaError] = React.useState(false)

  const onChangeEmail = event => {
    event.preventDefault()
    setEmail(event.target.value)

    if (event.target.value.trim() !== '') {
      enableCaptcha(captchaFeature)
    }
  }

  const onSubmit = (event: React.FormEvent) => {
    setFormCaptchaError(false)
    event.preventDefault()

    if (captchaFeature && !captcha) {
      setFormCaptchaError(true)
      throw new SubmissionError({
        captcha: 'registration.constraints.captcha.invalid',
      })
    }

    SubscribeNewsletterMutation.commit({
      input: {
        email,
        captcha,
      },
    })
      .then(response => {
        setCaptcha('')
        enableCaptcha(false)
        setEmail('')

        if (response.subscribeNewsletter?.errorCode === 'NEWSLETTER_INVALID_CAPTCHA') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({
              id: 'registration.constraints.captcha.invalid',
            }),
          })
        } else if (response.subscribeNewsletter?.errorCode === 'RATE_LIMIT_REACHED') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({
              id: 'global.error.server.form',
            }),
          })
        } else if (response.subscribeNewsletter?.errorCode === 'EMAIL_ALREADY_SUBSCRIBED') {
          toast({
            variant: 'info',
            content: intl.formatMessage({
              id: 'newsletter.already_subscribed',
            }),
          })
        } else {
          toast({
            variant: 'success',
            content: intl.formatMessage({
              id: 'homepage.newsletter.success',
            }),
          })
        }
      })
      .catch(() => {
        setCaptcha('')
        enableCaptcha(false)
        toast({
          variant: 'danger',
          content: intl.formatHTMLMessage({
            id: 'global.error.server.form',
          }),
        })
      })
  }

  return (
    <Flex justifyContent="center">
      <Flex direction="column" padding={4}>
        <form onSubmit={onSubmit} id="newsletterSubscriptionForm">
          <Flex mb={2}>
            <Input
              type="email"
              id="newsletter_subscription_email"
              value={email}
              className="form-control"
              placeholder={intl.formatMessage({
                id: 'homepage.newsletter.enter_email',
              })}
              aria-label={intl.formatMessage({
                id: 'homepage.newsletter.enter_email',
              })}
              onChange={onChangeEmail}
            />
            <button type="submit" disabled={!email} className="btn btn-primary">
              {intl.formatMessage({
                id: 'global.register',
              })}
            </button>
          </Flex>

          <div className={`form-group ${!captchaFeature ? 'hidden' : ''} ${formCaptchaError ? 'has-error' : ''}`}>
            <Captcha disabled={!captchaEnabled} onChange={captchaValue => setCaptcha(captchaValue)} />
            <span className={`error-block hidden-print ${formCaptchaError ? '' : 'hidden'}`}>
              {intl.formatMessage({
                id: 'registration.constraints.captcha.invalid',
              })}
            </span>
          </div>
        </form>
      </Flex>
    </Flex>
  )
}

export default NewsLetterInput
