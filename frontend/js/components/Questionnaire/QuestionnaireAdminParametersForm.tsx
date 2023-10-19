import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { reduxForm, Field } from 'redux-form'
import { ButtonToolbar, Button } from 'react-bootstrap'
import { createFragmentContainer, graphql } from 'react-relay'
import styled from 'styled-components'
import component from '../Form/Field'
import AlertForm from '../Alert/AlertForm'
import type { QuestionnaireAdminParametersForm_questionnaire } from '~relay/QuestionnaireAdminParametersForm_questionnaire.graphql'
import type { GlobalState, Dispatch } from '~/types'
import UpdateQuestionnaireParametersMutation from '../../mutations/UpdateQuestionnaireParametersMutation'
import Text from '~ui/Primitives/Text'
import AppBox from '~/components/Ui/Primitives/AppBox'

type RelayProps = {
  questionnaire: QuestionnaireAdminParametersForm_questionnaire
}
type Props = RelayProps &
  ReduxFormFormProps & {
    initialValues: Record<string, any>
  }
const AppBoxNoMargin = styled(AppBox)`
  .form-group,
  .form-group label {
    margin-bottom: 0 !important;
  }
`
const formName = 'questionnaire-admin-parameters'

const onSubmit = (values: Record<string, any>, dispatch: Dispatch, props: Props) => {
  const { questionnaire } = props
  values.questionnaireId = questionnaire.id
  delete values.id

  const questionnaireType = questionnaire.type === 'QUESTIONNAIRE_ANALYSIS' ? 'QUESTIONNAIRE_ANALYSIS' : 'QUESTIONNAIRE'

  return UpdateQuestionnaireParametersMutation.commit({
    input: {
      ...values,
      type: values.type === true ? questionnaireType : 'VOTING',
    },
  })
}

export const QuestionnaireAdminParametersForm = ({
  invalid,
  pristine,
  handleSubmit,
  submitting,
  valid,
  submitSucceeded,
  submitFailed,
}: Props) => {
  const intl = useIntl()
  return (
    <div className="box box-primary container-fluid">
      <div className="box-content">
        <form onSubmit={handleSubmit}>
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="global.notifications" />
            </h3>
          </div>
          <Field name="acknowledgeReplies" component={component} type="checkbox" id="questionnaire_notification">
            <FormattedMessage id="admin.fields.questionnaire.acknowledge_replies" />
          </Field>
          <div className="box-header">
            <h3 className="box-title">
              <FormattedMessage id="global.options" />
            </h3>
          </div>
          <AppBoxNoMargin>
            <Field name="anonymousAllowed" component={component} type="checkbox" id="questionnaire_anonymous">
              <Text color="gray.900" fontWeight={600}>
                {intl.formatMessage({
                  id: 'allow-user-to-hide-his-contribution',
                })}
              </Text>
            </Field>
            <Text mb={4} ml="2.5rem" color="gray.700" fontSize={2}>
              {intl.formatMessage({
                id: 'allow-user-to-hide-his-contribution-help',
              })}
            </Text>
          </AppBoxNoMargin>
          <Field name="multipleRepliesAllowed" component={component} type="checkbox" id="questionnaire_multiple">
            <FormattedMessage id="answer-several-times" />
          </Field>
          <Field name="type" component={component} type="checkbox" id="questionnaire_type">
            <FormattedMessage id="allow-draft-save" />
          </Field>

          <ButtonToolbar className="box-content__toolbar">
            <Button disabled={invalid || pristine || submitting} id="parameters-submit" type="submit" bsStyle="primary">
              <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
            </Button>
            <Button bsStyle="danger" disabled>
              <FormattedMessage id="global.delete" />
            </Button>
            <AlertForm
              valid={valid}
              invalid={invalid}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              submitting={submitting}
            />
          </ButtonToolbar>
        </form>
      </div>
    </div>
  )
}
const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(QuestionnaireAdminParametersForm)

const mapStateToProps = (state: GlobalState, props: RelayProps) => {
  const { questionnaire } = props
  return {
    initialValues: {
      anonymousAllowed: questionnaire.anonymousAllowed,
      multipleRepliesAllowed: questionnaire.multipleRepliesAllowed,
      type: ['QUESTIONNAIRE', 'QUESTIONNAIRE_ANALYSIS'].includes(questionnaire.type),
      acknowledgeReplies: questionnaire.acknowledgeReplies,
    },
  }
}

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(form)
export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment QuestionnaireAdminParametersForm_questionnaire on Questionnaire {
      id
      anonymousAllowed
      multipleRepliesAllowed
      type
      acknowledgeReplies
    }
  `,
})
