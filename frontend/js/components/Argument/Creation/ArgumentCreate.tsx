import React, { useState } from 'react'
import { reduxForm, Field, submit, SubmissionError, clearSubmitErrors } from 'redux-form'
import { graphql, createFragmentContainer } from 'react-relay'
import { FormattedMessage, FormattedHTMLMessage, useIntl, injectIntl } from 'react-intl'
import { Button, Alert } from 'react-bootstrap'
import { connect } from 'react-redux'
import component from '../../Form/Field'
import AddArgumentMutation from '../../../mutations/AddArgumentMutation'
import type { ArgumentType, State, Dispatch } from '../../../types'
import type { ArgumentCreate_argumentable } from '~relay/ArgumentCreate_argumentable.graphql'
import RequirementsFormModal from '../../Requirements/RequirementsModal'
import { toast } from '~ds/Toast'

type FormValues = {
  body: string | null | undefined
}
type FormValidValues = {
  body: string
}
type Props = ReduxFormFormProps & {
  type: ArgumentType
  argumentable: ArgumentCreate_argumentable
  user: {
    id: string
    isEmailConfirmed: boolean
  }
  submitting: boolean
  form: string
  dispatch: Dispatch
}

const onSubmit = (values: FormValidValues, dispatch: Dispatch, { argumentable, type, reset, user, intl }: Props) => {
  const input = {
    argumentableId: argumentable.id,
    body: values.body,
    type: type === 'FOR' || type === 'SIMPLE' ? 'FOR' : 'AGAINST',
  }
  return AddArgumentMutation.commit(
    {
      input,
    },
    user.isEmailConfirmed,
  )
    .then(res => {
      if (res.addArgument && res.addArgument.userErrors.length === 0) {
        toast({ content: intl.formatMessage({ id: 'alert.success.add.argument' }), variant: 'success' })
        reset()
        return
      }

      if (res.addArgument) {
        for (const error of res.addArgument.userErrors) {
          if (error.message === 'You contributed too many times.') {
            throw new SubmissionError({
              _error: 'publication-limit-reached',
            })
          }
        }
      }

      throw new SubmissionError({
        _error: 'global.error.server.form',
      })
    })
    .catch(e => {
      if (e instanceof SubmissionError) {
        throw e
      }

      throw new SubmissionError({
        _error: 'global.error.server.form',
      })
    })
}

const validate = ({ body }: FormValues) => {
  const errors: any = {}

  if (!body || body.replace(/<\/?[^>]+(>|$)/g, '').length <= 2) {
    errors.body = 'argument.constraints.min'
  }

  if (body && body.length > 2000) {
    errors.body = 'argument.constraints.max'
  }

  return errors
}

export const ArgumentCreate = ({ user, argumentable, type, dispatch, form, submitting, error }: Props) => {
  const intl = useIntl()
  const [showModal, setShowModal] = useState<boolean>(false)

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const disabled = !argumentable.contribuable || !user
  return (
    <div className="opinion__body box">
      {argumentable.step && (
        <RequirementsFormModal step={argumentable.step} handleClose={closeModal} show={showModal} />
      )}
      <div
        className="opinion__data"
        style={{
          overflow: 'visible',
        }}
      >
        <form id={`argument-form--${type}`}>
          {error && (
            <Alert
              bsStyle="warning"
              onDismiss={() => {
                dispatch(clearSubmitErrors(form))
              }}
            >
              {error === 'publication-limit-reached' ? (
                <div>
                  <h4>
                    <strong>
                      <FormattedMessage id="publication-limit-reached" />
                    </strong>
                  </h4>
                  <FormattedMessage id="publication-limit-reached-argument-content" />
                </div>
              ) : (
                <FormattedHTMLMessage id="global.error.server.form" />
              )}
            </Alert>
          )}
          <Field
            name="body"
            component={component}
            id={`arguments-body-${type}`}
            type="textarea"
            rows={2}
            label={<FormattedMessage id={`argument.${type === 'AGAINST' ? 'no' : 'yes'}.add`} />}
            placeholder={`argument.${type === 'AGAINST' ? 'no' : 'yes'}.add`}
            labelClassName="sr-only"
            disabled={disabled}
          />
          {!disabled && (
            <Button
              aria-label={intl.formatMessage({
                id: 'argument.publication.email.button',
              })}
              disabled={submitting}
              onClick={() => {
                if (
                  argumentable.step &&
                  argumentable.step.requirements &&
                  !argumentable.step.requirements.viewerMeetsTheRequirements
                ) {
                  openModal()
                  return
                }

                dispatch(submit(form))
              }}
              bsStyle="primary"
            >
              <FormattedMessage id={submitting ? 'global.loading' : 'global.send'} />
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}

const mapStateToProps = (state: State) => ({
  user: state.user.user,
})

// @ts-ignore
const container = injectIntl(
  connect(mapStateToProps)(
    reduxForm({
      onSubmit,
      validate,
    })(ArgumentCreate),
  ),
)
export default createFragmentContainer(container, {
  argumentable: graphql`
    fragment ArgumentCreate_argumentable on Argumentable @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      contribuable
      ... on Opinion {
        step {
          requirements {
            viewerMeetsTheRequirements @include(if: $isAuthenticated)
          }
          ...RequirementsFormLegacy_step @arguments(isAuthenticated: $isAuthenticated)

          ...RequirementsModal_step @arguments(isAuthenticated: $isAuthenticated)
        }
      }
      ... on Version {
        step {
          requirements {
            viewerMeetsTheRequirements @include(if: $isAuthenticated)
          }
          ...RequirementsFormLegacy_step @arguments(isAuthenticated: $isAuthenticated)

          ...RequirementsModal_step @arguments(isAuthenticated: $isAuthenticated)
        }
      }
    }
  `,
})
