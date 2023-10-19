import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FieldArray, reduxForm } from 'redux-form'
import type { RelayFragmentContainer } from 'react-relay'
import { createFragmentContainer, graphql } from 'react-relay'
import { Button } from 'react-bootstrap'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
import type { RegistrationFormQuestions_registrationForm } from '~relay/RegistrationFormQuestions_registrationForm.graphql'
import type { State } from '../../types'
import ProposalFormAdminQuestions from '../ProposalForm/ProposalFormAdminQuestions'
import UpdateRegistrationFormQuestionsMutation from '../../mutations/UpdateRegistrationFormQuestionsMutation'
import AlertForm from '../Alert/AlertForm'
import { submitQuestion } from '../../utils/submitQuestion'
import { asyncValidate } from '~/components/Questionnaire/QuestionnaireAdminConfigurationForm'

type Props = ReduxFormFormProps & {
  registrationForm: RegistrationFormQuestions_registrationForm
  intl: IntlShape
}
const formName = 'registration-form-questions'

const onSubmit = (values: Record<string, any>) => {
  values.questions.map(question => {
    if (question.importedResponses || question.importedResponses === null) {
      delete question.importedResponses
    }
  })
  const input = {
    questions: submitQuestion(values.questions),
  }
  const nbChoices = input.questions.reduce((acc, array) => {
    if (array && array.question && array.question.choices && array.question.choices.length) {
      acc += array.question.choices.length
    }

    return acc
  }, 0)
  return UpdateRegistrationFormQuestionsMutation.commit({
    input,
  }).then(() => {
    if (nbChoices > 1500) {
      window.location.reload()
    }
  })
}

class RegistrationFormQuestions extends Component<Props> {
  render() {
    const { invalid, pristine, submitting, handleSubmit, valid, submitSucceeded, submitFailed } = this.props
    return (
      <form onSubmit={handleSubmit}>
        <FieldArray name="questions" component={ProposalFormAdminQuestions} formName={formName} hideSections />
        <Button
          disabled={invalid || pristine || submitting}
          type="submit"
          bsStyle="primary"
          id="proposal-form-admin-content-save"
        >
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
        </Button>
        <AlertForm
          valid={valid}
          invalid={invalid}
          submitting={submitting}
          submitSucceeded={submitSucceeded}
          submitFailed={submitFailed}
        />
      </form>
    )
  }
}

const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
  asyncValidate,
})(RegistrationFormQuestions)

const mapStateToProps = (state: State, props: Props) => ({
  initialValues: {
    ...props.registrationForm,
    questions:
      props.registrationForm &&
      props.registrationForm.questions.map(question => {
        if (question.__typename !== 'MultipleChoiceQuestion')
          return { ...question, descriptionUsingJoditWysiwyg: question.descriptionUsingJoditWysiwyg !== false }
        const choices =
          question.choices && question.choices.edges
            ? question.choices.edges
                .filter(Boolean)
                .map(edge => ({
                  ...edge.node,
                  descriptionUsingJoditWysiwyg: edge.node?.descriptionUsingJoditWysiwyg !== false,
                }))
                .filter(Boolean)
            : []
        return { ...question, choices, descriptionUsingJoditWysiwyg: question.descriptionUsingJoditWysiwyg !== false }
      }),
  },
})

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(injectIntl(form))
export default createFragmentContainer(container, {
  registrationForm: graphql`
    fragment RegistrationFormQuestions_registrationForm on RegistrationForm {
      id
      questions {
        id
        ...responsesHelper_adminQuestion @relay(mask: false)
      }
    }
  `,
}) as RelayFragmentContainer<typeof container>
