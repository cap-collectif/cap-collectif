// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { reduxForm, Field, type FormProps } from 'redux-form';
import { ButtonToolbar, Button } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import component from '../Form/Field';
import AlertForm from '../Alert/AlertForm';
import type { QuestionnaireAdminParametersForm_questionnaire } from './__generated__/QuestionnaireAdminParametersForm_questionnaire.graphql';
import type { State } from '../../types';
import UpdateQuestionnaireParametersMutation from '../../mutations/UpdateQuestionnaireParametersMutation';

type RelayProps = {
  questionnaire: QuestionnaireAdminParametersForm_questionnaire,
};
type Props = RelayProps & FormProps;

const formName = 'questionnaire-admin-parameters';

const validate = () => ({});

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { questionnaire } = props;
  values.questionnaireId = questionnaire.id;
  delete values.id;
  return UpdateQuestionnaireParametersMutation.commit({
    input: values,
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
    } = this.props;

    return (
      <div className="box box-primary container-fluid">
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="user.profile.notifications.title" />
              </h3>
            </div>
            <Field
              name="acknowledgeReplies"
              children={<FormattedMessage id="admin.fields.questionnaire.acknowledge_replies" />}
              component={component}
              type="checkbox"
              id="questionnaire_notification"
            />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="proposal_form.admin.settings.options" />
              </h3>
            </div>
            <Field
              name="anonymousAllowed"
              children={<FormattedMessage id="reply-anonymously" />}
              component={component}
              type="checkbox"
              id="questionnaire_anonymous"
            />
            <Field
              name="multipleRepliesAllowed"
              children={<FormattedMessage id="answer-several-times" />}
              component={component}
              type="checkbox"
              id="questionnaire_multiple"
            />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="requirements" />
              </h3>
            </div>
            <Field
              name="phoneConfirmation"
              children={<FormattedMessage id="phone-number-verified-by-sms" />}
              component={component}
              type="checkbox"
              id="questionnaire_sms"
            />
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

const form = reduxForm({
  onSubmit,
  validate,
  form: formName,
})(QuestionnaireAdminParametersForm);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => {
  const { questionnaire } = props;
  return {
    initialValues: {
      anonymousAllowed: questionnaire.anonymousAllowed,
      phoneConfirmation: questionnaire.phoneConfirmation,
      multipleRepliesAllowed: questionnaire.multipleRepliesAllowed,
      acknowledgeReplies: questionnaire.acknowledgeReplies,
    },
  };
};

const container = connect(mapStateToProps)(form);
const containerIntl = injectIntl(container);

export default createFragmentContainer(containerIntl, {
  questionnaire: graphql`
    fragment QuestionnaireAdminParametersForm_questionnaire on Questionnaire {
      id
      anonymousAllowed
      phoneConfirmation
      multipleRepliesAllowed
      acknowledgeReplies
    }
  `,
});
