import React from 'react'
import { Field, reduxForm, SubmissionError, submit } from 'redux-form'
import { FormattedMessage } from 'react-intl'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { Panel } from 'react-bootstrap'
import UserPasswordField from '~/components/User/UserPasswordField'
import component from '~/components/Form/Field'
import type { Dispatch } from '~/types'
import { asyncPasswordValidate } from '~/components/User/UserPasswordComplexityUtils'
import SubmitButton from '~/components/Form/SubmitButton'
import ResetPasswordMutation from '~/mutations/ResetPasswordMutation'

export type Props = ReduxFormFormProps & {
  token: string
}
type FormValues = {
  token: string
  new_password: string
  new_password_confirmation: string
}
export const validate = (values: FormValues) => {
  const errors: any = {}

  if (!values.new_password && !values.new_password_confirmation) {
    return {}
  }

  if (!values.new_password || values.new_password.length < 1) {
    errors.new_password = 'at-least-8-characters-one-digit-one-uppercase-one-lowercase'
  }

  if (!values.new_password_confirmation || values.new_password_confirmation.length < 1) {
    errors.new_password_confirmation = 'fos_user.password.mismatch'
  }

  if (
    values.new_password &&
    values.new_password_confirmation &&
    values.new_password_confirmation !== values.new_password
  ) {
    errors.new_password_confirmation = 'fos_user.password.mismatch'
  }

  return errors
}

const onSubmit = (values: FormValues, dispatch: Dispatch, { intl, token }) => {
  const input = {
    token,
    password: values.new_password,
  }
  return ResetPasswordMutation.commit({
    input,
  }).then(response => {
    if (!response.resetPassword || !response.resetPassword.user || response.resetPassword.error) {
      if (response.resetPassword && response.resetPassword.error) {
        throw new SubmissionError({
          _error: response.resetPassword.error,
        })
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({
            id: 'global.error.server.form',
          }),
        })
      }
    }

    if (response.resetPassword.user) {
      window.location.href = '/'
    }
  })
}

export const formName = 'recreate_password_form'
const Container: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  width: 50%;
  margin: 20px auto;

  .reset-password-form {
    margin: auto;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
  }
`
export const ResetPasswordForm = ({ submitting, pristine, dispatch, invalid, handleSubmit }: Props) => {
  return (
    <Container>
      <form className="reset-password-form" onSubmit={handleSubmit}>
        <Panel>
          <Panel.Body>
            <div className="flex-column ml-10 mr-10">
              <label htmlFor="password-form-new">
                <FormattedMessage id="change_password.form.password" />
              </label>
              <UserPasswordField formName={formName} id="password-form-new" name="new_password" />
              <label htmlFor="password-form-confirmation">
                <FormattedMessage id="change_password.form.password_confirmation" />
              </label>
              <Field
                type="password"
                component={component}
                name="new_password_confirmation"
                id="password-form-confirmation"
              />
              <SubmitButton
                label="global.confirm"
                bsStyle="success"
                id="reset-content-confirm"
                disabled={pristine || submitting || invalid}
                isSubmitting={submitting}
                onSubmit={() => dispatch(submit(formName))}
              />
            </div>
          </Panel.Body>
        </Panel>
      </form>
    </Container>
  )
}

const asyncValidate = (values: FormValues, dispatch: Dispatch) => {
  return asyncPasswordValidate(formName, 'new_password', values, dispatch)
}

export default reduxForm({
  onSubmit,
  validate,
  asyncValidate,
  form: formName,
})(ResetPasswordForm)
