// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { ButtonToolbar, Button } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import component from '../Form/Field';
import AlertForm from '../Alert/AlertForm';
import type { QuestionnaireAdminParametersForm_questionnaire } from '~relay/QuestionnaireAdminParametersForm_questionnaire.graphql';
import type { GlobalState, Dispatch } from '../../types';
import UpdateQuestionnaireParametersMutation from '../../mutations/UpdateQuestionnaireParametersMutation';

type RelayProps = {|
  questionnaire: QuestionnaireAdminParametersForm_questionnaire,
|};
type Props = {|
  ...RelayProps,
  ...ReduxFormFormProps,
  currentValues: Object,
  initialValues: Object,
  isOnlyProjectAdmin: boolean,
|};

const formName = 'questionnaire-admin-parameters';

const validate = () => ({});

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { questionnaire } = props;
  values.questionnaireId = questionnaire.id;
  delete values.id;

  const privateResult = values.privateResult === 'private';

  return UpdateQuestionnaireParametersMutation.commit({
    input: {
      ...values,
      privateResult,
    },
  });
};

export class QuestionnaireAdminParametersForm extends React.Component<Props> {
  render() {
    const {
      invalid,
      pristine,
      handleSubmit,
      submitting,
      valid,
      submitSucceeded,
      submitFailed,
      currentValues,
      isOnlyProjectAdmin,
    } = this.props;

    return (
      <div className="box box-primary container-fluid">
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="global.notifications" />
              </h3>
            </div>
            <Field
              name="acknowledgeReplies"
              component={component}
              type="checkbox"
              id="questionnaire_notification">
              <FormattedMessage id="admin.fields.questionnaire.acknowledge_replies" />
            </Field>
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="global.options" />
              </h3>
            </div>
            <Field
              name="anonymousAllowed"
              component={component}
              type="checkbox"
              id="questionnaire_anonymous">
              <FormattedMessage id="reply-anonymously" />
            </Field>
            <Field
              name="multipleRepliesAllowed"
              component={component}
              type="checkbox"
              id="questionnaire_multiple">
              <FormattedMessage id="answer-several-times" />
            </Field>
            {!isOnlyProjectAdmin && (
              <>
                <div className="box-header">
                  <h3 className="box-title">
                    <FormattedMessage id="results" />
                  </h3>
                </div>
                <Field
                  name="privateResult"
                  component={component}
                  type="radio"
                  id="questionnaire_private"
                  checked={currentValues.privateResult === 'private'}
                  value="private">
                  <>
                    <i className="cap-lock-2-1 mr-5" />
                    <FormattedMessage id="administrators" />
                  </>
                </Field>
                <Field
                  name="privateResult"
                  component={component}
                  type="radio"
                  checked={currentValues.privateResult === 'public'}
                  id="questionnaire_public"
                  value="public">
                  <>
                    <i className="cap-chat-security mr-5" />
                    <FormattedMessage id="persons-with-access-to-the-project" />
                  </>
                </Field>
              </>
            )}
            <ButtonToolbar className="box-content__toolbar">
              <Button
                disabled={invalid || pristine || submitting}
                id="parameters-submit"
                type="submit"
                bsStyle="primary">
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
    );
  }
}

const selector = formValueSelector(formName);

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(QuestionnaireAdminParametersForm);

const mapStateToProps = (state: GlobalState, props: RelayProps) => {
  const { questionnaire } = props;
  return {
    initialValues: {
      anonymousAllowed: questionnaire.anonymousAllowed,
      multipleRepliesAllowed: questionnaire.multipleRepliesAllowed,
      acknowledgeReplies: questionnaire.acknowledgeReplies,
      privateResult: questionnaire.privateResult ? 'private' : 'public',
    },
    currentValues: {
      privateResult: selector(state, 'privateResult'),
    },
    isOnlyProjectAdmin: state?.user?.user?.isOnlyProjectAdmin,
  };
};

const container = connect<any, any, _, _, _, _>(mapStateToProps)(form);
const containerIntl = injectIntl(container);

export default createFragmentContainer(containerIntl, {
  questionnaire: graphql`
    fragment QuestionnaireAdminParametersForm_questionnaire on Questionnaire {
      id
      anonymousAllowed
      multipleRepliesAllowed
      acknowledgeReplies
      privateResult
    }
  `,
});
