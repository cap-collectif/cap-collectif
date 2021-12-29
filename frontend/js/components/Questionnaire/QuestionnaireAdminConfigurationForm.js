// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { change, Field, FieldArray, reduxForm, SubmissionError } from 'redux-form';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';
import { type QuestionsInReduxForm, submitQuestion } from '~/utils/submitQuestion';
import AlertForm from '../Alert/AlertForm';
import component from '../Form/Field';
import UpdateQuestionnaireConfigurationMutation from '../../mutations/UpdateQuestionnaireConfigurationMutation';
import ProposalFormAdminQuestions from '../ProposalForm/ProposalFormAdminQuestions';
import type { QuestionnaireAdminConfigurationForm_questionnaire } from '~relay/QuestionnaireAdminConfigurationForm_questionnaire.graphql';
import type { Dispatch, FeatureToggles, State } from '~/types';
import formatChoices from '~/utils/form/formatChoices';

type RelayProps = {| +questionnaire: QuestionnaireAdminConfigurationForm_questionnaire |};
type ReduxProps = {| +questionnaireResultsEnabled: boolean |};
type Props = {|
  ...RelayProps,
  ...ReduxProps,
  ...ReduxFormFormProps,
  intl: IntlShape,
  features: FeatureToggles,
|};

export type Jump = {|
  +id?: string,
  +origin: {
    id: string,
    title?: string,
  },
  +destination: {
    id: string,
    title?: string,
  },
  +conditions: Object,
|};

export type Jumps = ?$ReadOnlyArray<Jump>;
export type MultipleChoiceQuestionValidationRulesTypes = 'EQUAL' | 'MAX' | 'MIN';
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

export type CsvValues = {|
  importedResponses: {
    data: string,
    oldMember: string,
    type: string,
    fileType: string,
  },
|};

type FormValues = {|
  questionnaireId: string,
  title: string,
  description: ?string,
  questions: QuestionsInReduxForm,
  ...CsvValues,
|};

const formName = 'questionnaire-admin-configuration';

const validate = (values: FormValues) => {
  if (Object.keys(values).length === 0) {
    return {};
  }

  const errors = {};
  if (!values.title || values.title.length <= 2) {
    errors.title = 'title';
  }

  if (values.questions.length) {
    const questionsArrayErrors = [];
    values.questions.forEach((question: Object, questionIndex: number) => {
      const questionErrors = {};
      if (!question.title || question.title.length === 0) {
        questionErrors.title = 'global.title';
        questionsArrayErrors[questionIndex] = questionErrors;
      }
      if (question.title && question.title.length > 255) {
        questionErrors.title = 'question.title.max_length';
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
  const { questionnaireResultsEnabled } = props;
  values.questions.map(question => {
    /* $FlowFixMe */
    if (question.importedResponses || question.importedResponses === null) {
      /* $FlowFixMe we need to do something about the question types but I don't have time */
      delete question.importedResponses;
    }
  });

  const input = {
    ...values,
    id: undefined,
    questionnaireId: props.questionnaire.id,
    questions: submitQuestion(values.questions),
  };

  const nbChoices = input.questions.reduce((acc, array) => {
    if (array && array.question && array.question.choices && array.question.choices.length) {
      acc += array.question.choices.length;
    }
    return acc;
  }, 0);

  // $FlowFixMe
  return UpdateQuestionnaireConfigurationMutation.commit({ input, questionnaireResultsEnabled })
    .then(() => {
      if (nbChoices > 1500) {
        window.location.reload();
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};
export const getUnique = (values: Array<string>) => {
  const cleanValues = [];
  const duplicatedValues = [];

  for (let i = 0; i < values.length; i++) {
    if (cleanValues.indexOf(values[i]) === -1) {
      if (values[i] !== '') {
        cleanValues.push(values[i]);
      }
    } else {
      duplicatedValues.push(values[i]);
    }
  }

  return { cleanValues, duplicatedValues };
};
export const prepareVariablesFromAnalyzedFile = (
  csvString: string,
  dryRun: boolean,
): {
  input: {
    importedResponses: Object,
    dryRun: boolean,
    uniqResponses: Array<{ title: string }>,
    doublons: Array<string>,
  },
} => {
  let importedResponses = csvString
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((importedResponse: string) => importedResponse.replace(/['"]+/g, ''));

  // detects if first line is a header
  if (importedResponses.length > 0) {
    importedResponses.shift();
  }

  importedResponses = getUnique(importedResponses);
  const uniqResponses = importedResponses.cleanValues.map(response => ({ title: response }));

  return {
    input: {
      importedResponses,
      uniqResponses,
      doublons: importedResponses.duplicatedValues,
      dryRun,
    },
  };
};

export const asyncValidate = (values: Object, dispatch: Dispatch, props: Object): Promise<*> => {
  const question = values.questions.find(q => q.importedResponses);
  if (!question) {
    return new Promise(resolve => {
      resolve();
    });
  }

  const { importedResponses } = question;
  const member = `${importedResponses.oldMember}.importedResponses`;

  if (
    importedResponses.fileType !== 'text/csv' &&
    importedResponses.fileType !== '.csv' &&
    importedResponses.fileType !== 'application/vnd.ms-excel'
  ) {
    return new Promise(resolve => {
      resolve();
    }).then(() => {
      // simulate server latency
      dispatch(
        change(props.form, member, {
          data: [],
          doublons: null,
          error: true,
        }),
      );
    });
  }

  const variables = prepareVariablesFromAnalyzedFile(importedResponses.data, true);
  if (!variables) {
    return Promise.reject({
      [member]: 'Failed to read question responses from uploaded file.',
    });
  }
  return new Promise(resolve => {
    resolve();
  }).then(() => {
    dispatch(
      change(props.form, member, {
        data: variables.input.uniqResponses,
        doublons: variables.input.doublons,
        oldMember: importedResponses.oldMember,
      }),
    );
  });
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
            <FormattedMessage id="global.general" />
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
              label={<FormattedMessage id="global.title" />}
            />
            <Field
              name="description"
              component={component}
              type="admin-editor"
              id="proposal_form_description"
              label={<FormattedMessage id="global.description" />}
            />
            <div className="box-header">
              <h3 className="box-title">
                <FormattedMessage id="global.contenu" />
              </h3>
            </div>
            <FieldArray
              name="questions"
              component={ProposalFormAdminQuestions}
              formName={formName}
            />
            <ButtonToolbar
              className="box-content__toolbar"
              id="questionnaire-admin-configuration-toolbar">
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
  asyncValidate,
})(QuestionnaireAdminConfigurationForm);

const mapStateToProps = (state: State, props: RelayProps) => {
  const questionnaire = formatChoices(props.questionnaire);
  return {
    questionnaireResultsEnabled: state.default.features.beta__questionnaire_result,
    initialValues: {
      title: questionnaire.title,
      description: questionnaire.description,
      questions: questionnaire.questions,
    },
  };
};

const container = connect<any, any, _, _, _, _>(mapStateToProps)(form);
const intlContainer = injectIntl(container);

export default createFragmentContainer(intlContainer, {
  questionnaire: graphql`
    fragment QuestionnaireAdminConfigurationForm_questionnaire on Questionnaire {
      id
      title
      description
      questions {
        id
        ...responsesHelper_adminQuestion @relay(mask: false)
      }
    }
  `,
});
