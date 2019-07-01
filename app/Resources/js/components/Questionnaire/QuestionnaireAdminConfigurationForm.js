// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { Field, FieldArray, type FormProps, reduxForm } from 'redux-form';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import { type QuestionsInReduxForm, submitQuestion } from '../../utils/submitQuestion';
import AlertForm from '../Alert/AlertForm';
import component from '../Form/Field';
import UpdateQuestionnaireConfigurationMutation from '../../mutations/UpdateQuestionnaireConfigurationMutation';
import ProposalFormAdminQuestions from '../ProposalForm/ProposalFormAdminQuestions';
import type { QuestionnaireAdminConfigurationForm_questionnaire } from '~relay/QuestionnaireAdminConfigurationForm_questionnaire.graphql';
import type { FeatureToggles, State } from '../../types';

type RelayProps = {| questionnaire: QuestionnaireAdminConfigurationForm_questionnaire |};
type Props = {|
  ...RelayProps,
  ...FormProps,
  intl: IntlShape,
  features: FeatureToggles,
|};

export type Jumps = ?$ReadOnlyArray<{|
  +id?: string,
  +origin: {
    id: number,
    title: string,
  },
  +destination: {
    id: number,
    title: string,
  },
  +conditions: Object,
|}>;
export type MultipleChoiceQuestionValidationRulesTypes = 'EQUAL' | 'MAX' | 'MIN';
export type QuestionChoiceColor = 'DANGER' | 'INFO' | 'PRIMARY' | 'SUCCESS' | 'WARNING';
export type QuestionTypeValue =
  | 'button'
  | 'checkbox'
  | 'editor'
  | 'medias'
  | 'radio'
  | 'ranking'
  | 'select'
  | 'text'
  | 'textarea';
type FormValues = {
  questionnaireId: string,
  title: string,
  description: ?string,
  questions: QuestionsInReduxForm,
};
const formName = 'questionnaire-admin-configuration';

const validate = (values: FormValues) => {
  const errors = {};
  if (!values.title || values.title.length <= 2) {
    errors.title = 'title';
  }

  if (values.questions.length) {
    const questionsArrayErrors = [];
    values.questions.forEach((question: Object, questionIndex: number) => {
      const questionErrors = {};
      if (!question.title || question.title.length === 0) {
        questionErrors.title = 'admin.fields.questionnaire.title';
        questionsArrayErrors[questionIndex] = questionErrors;
      }

      if (!question.type || question.type.length === 0) {
        questionErrors.type = 'admin.fields.proposal_form.errors.question.type';
        questionsArrayErrors[questionIndex] = questionErrors;
      }
    });

    if (questionsArrayErrors.length) {
      errors.questions = questionsArrayErrors;
    }
  }

  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const input = {
    ...values,
    id: undefined,
    questionnaireId: props.questionnaire.id,
    questions: submitQuestion(values.questions),
  };

  // $FlowFixMe
  return UpdateQuestionnaireConfigurationMutation.commit({ input });
};

export class QuestionnaireAdminConfigurationForm extends React.Component<Props> {
  render() {
    const {
      intl,
      invalid,
      pristine,
      valid,
      handleSubmit,
      submitting,
      submitSucceeded,
      submitFailed,
    } = this.props;

    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="admin.label.settings.global" />
          </h3>
          <a
            className="pull-right link"
            rel="noopener noreferrer"
            href={intl.formatMessage({ id: 'admin.help.link.form.configuration' })}>
            <i className="fa fa-info-circle" /> <FormattedMessage id="global.help" />
          </a>
        </div>
        <div className="box-content">
          <form onSubmit={handleSubmit}>
            <Field
              name="title"
              component={component}
              type="text"
              id="questionnaire_title"
              label={<FormattedMessage id="admin.fields.questionnaire.title" />}
            />
            <Field
              name="description"
              component={component}
              type="editor"
              id="proposal_form_description"
              label={<FormattedMessage id="admin.fields.questionnaire.description" />}
            />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="proposal.admin.content" />
              </h3>
            </div>
            <FieldArray
              name="questions"
              component={ProposalFormAdminQuestions}
              formName={formName}
            />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="admin.label.settings.notifications" />
              </h3>
              <h4 className="mb-3 mt-0">
                <FormattedMessage id="notification.answer.created" />
              </h4>
              <Field
                name="notifyResponseCreate"
                component={component}
                type="checkbox"
                id="notify_response_create">
                <FormattedMessage id="proposal_form.notifications.on_create" />
              </Field>
              <Field
                name="notifyResponseUpdate"
                component={component}
                type="checkbox"
                id="notify_response_update">
                <FormattedMessage id="admin.fields.proposal_form.notification.on_update" />
              </Field>
              <Field
                name="notifyResponseDelete"
                component={component}
                type="checkbox"
                id="notify_response_delete">
                <FormattedMessage id="admin.fields.proposal_form.notification.on_delete" />
              </Field>
            </div>
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
  validate,
  onSubmit,
  form: formName,
  enableReinitialize: true,
})(QuestionnaireAdminConfigurationForm);

const mapStateToProps = (state: State, props: RelayProps) => ({
  initialValues: { ...props.questionnaire, id: undefined }
});

const container = connect(mapStateToProps)(form);
const intlContainer = injectIntl(container);

export default createFragmentContainer(intlContainer, {
  questionnaire: graphql`
    fragment QuestionnaireAdminConfigurationForm_questionnaire on Questionnaire {
      id
      title
      description
      notifyResponseCreate
      notifyResponseUpdate
      notifyResponseDelete
      questions {
        id
        ...responsesHelper_adminQuestion @relay(mask: false)
      }
    }
  `,
});
