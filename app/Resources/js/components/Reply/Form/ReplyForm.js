// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import {
  type FormProps,
  formValueSelector,
  reduxForm,
  FieldArray,
  Field,
  SubmissionError,
} from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import type { Dispatch, State } from '../../../types';
import type { ReplyForm_questionnaire } from './__generated__/ReplyForm_questionnaire.graphql';
import type { ReplyForm_reply } from './__generated__/ReplyForm_reply.graphql';
import {
  formatInitialResponsesValues,
  renderResponses,
  formatSubmitResponses,
  type ResponsesInReduxForm,
} from '../../../utils/responsesHelper';
import renderComponent from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import AddReplyMutation from '../../../mutations/AddReplyMutation';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import UpdateReplyMutation from '../../../mutations/UpdateReplyMutation';

type Props = FormProps & {
  +questionnaire: ReplyForm_questionnaire,
  +reply: ?ReplyForm_reply,
  +responses: ResponsesInReduxForm,
  +user: ?Object,
  +intl: IntlShape,
  +onClose?: () => void,
};

type FormValues = {|
  responses: ResponsesInReduxForm,
  private: boolean,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { questionnaire, reply, onClose } = props;

  const data = {};

  data.responses = formatSubmitResponses(values.responses, questionnaire.questions);

  if (reply) {
    data.replyId = reply.id;
    return UpdateReplyMutation.commit({ input: data })
      .then(() => {
        AppDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: { bsStyle: 'success', content: 'reply.request.create.success' },
        });
        if (questionnaire.multipleRepliesAllowed) {
          props.reset();
        }
        if (onClose) {
          onClose();
        }
      })
      .catch(() => {
        throw new SubmissionError({
          _error: 'global.error.server.form',
        });
      });
  }
  data.questionnaireId = questionnaire.id;

  if (questionnaire.anonymousAllowed) {
    data.private = values.private;
  }

  return AddReplyMutation.commit({ input: data })
    .then(() => {
      AppDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: { bsStyle: 'success', content: 'reply.request.create.success' },
      });
      if (questionnaire.multipleRepliesAllowed) {
        props.reset();
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = (values: FormValues, props: Props) => {
  const { questionnaire } = props;
  const { responses } = values;
  const errors = {};

  const responsesError = [];
  questionnaire.questions.map((question, index) => {
    responsesError[index] = {};
    const response = responses.filter(res => res && res.question === question.id)[0];

    if (question.required) {
      if (question.type === 'medias') {
        if (!response || (Array.isArray(response.value) && response.value.length === 0)) {
          responsesError[index] = { value: 'reply.constraints.field_mandatory' };
        }
      } else if (!response || !response.value) {
        responsesError[index] = { value: 'reply.constraints.field_mandatory' };
      }
    }

    if (
      question.validationRule &&
      question.type !== 'button' &&
      response.value &&
      typeof response.value === 'object' &&
      (Array.isArray(response.value.labels) || Array.isArray(response.value))
    ) {
      const rule = question.validationRule;
      let responsesNumber = 0;
      if (typeof response.value === 'object' && Array.isArray(response.value.labels)) {
        const labelsNumber = response.value.labels.length;
        const hasOtherValue = response.value.other ? 1 : 0;
        responsesNumber = labelsNumber + hasOtherValue;
      }

      if (typeof response.value === 'object' && Array.isArray(response.value)) {
        responsesNumber = response.value.length;
      }

      if (rule.type === 'MIN' && (rule.number && responsesNumber < rule.number)) {
        responsesError[index] = {
          value: props.intl.formatMessage(
            { id: 'reply.constraints.choices_min' },
            { nb: rule.number },
          ),
        };
      }

      if (rule.type === 'MAX' && (rule.number && responsesNumber > rule.number)) {
        responsesError[index] = {
          value: props.intl.formatMessage(
            { id: 'reply.constraints.choices_max' },
            { nb: rule.number },
          ),
        };
      }

      if (rule.type === 'EQUAL' && responsesNumber !== rule.number) {
        responsesError[index] = {
          value: props.intl.formatMessage(
            { id: 'reply.constraints.choices_equal' },
            { nb: rule.number },
          ),
        };
      }
    }
  });

  if (responsesError.length) {
    errors.responses = responsesError;
  }

  return errors;
};

export const formName = 'ReplyForm';

export class ReplyForm extends React.Component<Props> {
  static defaultProps = {
    reply: null,
  };

  formIsDisabled() {
    const { questionnaire, user } = this.props;

    return (
      !questionnaire.contribuable ||
      !user ||
      (questionnaire.phoneConfirmationRequired && !user.isPhoneConfirmed) ||
      (questionnaire.viewerReplies &&
        questionnaire.viewerReplies.length > 0 &&
        !questionnaire.multipleRepliesAllowed)
    );
  }

  render() {
    const {
      intl,
      questionnaire,
      submitting,
      pristine,
      invalid,
      valid,
      change,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      responses,
    } = this.props;

    const disabled = this.formIsDisabled();

    return (
      <div id="create-reply-form">
        <form id="reply-form" ref="form" onSubmit={handleSubmit}>
          {questionnaire.description && (
            <p dangerouslySetInnerHTML={{ __html: questionnaire.description }} />
          )}
          <FieldArray
            name="responses"
            change={change}
            responses={responses}
            component={renderResponses}
            questions={questionnaire.questions}
            intl={intl}
            disabled={disabled}
          />
          {questionnaire.anonymousAllowed && (
            <div>
              <hr style={{ marginBottom: '30px' }} />
              <Field
                type="checkbox"
                name="private"
                id="reply-private"
                component={renderComponent}
                children={<FormattedMessage id="reply.form.private" />}
                disabled={disabled}
              />
            </div>
          )}
          <Button
            type="submit"
            id="submit-create-reply"
            bsStyle="primary"
            disabled={pristine || invalid || submitting || disabled}>
            <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
          </Button>
          {!disabled &&
            !pristine && (
              <AlertForm
                valid={valid}
                invalid={invalid}
                submitSucceeded={submitSucceeded}
                submitFailed={submitFailed}
                submitting={submitting}
              />
            )}
        </form>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  responses: formValueSelector(formName)(state, 'responses'),
  initialValues: {
    responses: formatInitialResponsesValues(
      props.questionnaire.questions,
      props.reply ? props.reply.responses : [],
    ),
    private: props.reply ? props.reply.private : false,
  },
  user: state.user.user,
  form: props.reply ? `reply-update-${props.reply.id}` : formName,
});

const form = reduxForm({
  validate,
  onSubmit,
})(ReplyForm);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  reply: graphql`
    fragment ReplyForm_reply on Reply
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      id
      private
      responses {
        question {
          id
        }
        ... on ValueResponse {
          value
        }
        ... on MediaResponse {
          medias {
            id
            name
            size
            url
          }
        }
      }
    }
  `,
  questionnaire: graphql`
    fragment ReplyForm_questionnaire on Questionnaire
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      anonymousAllowed
      description
      multipleRepliesAllowed
      phoneConfirmationRequired
      contribuable
      viewerReplies @include(if: $isAuthenticated) {
        id
      }
      title
      id
      questions {
        id
        title
        private
        required
        description
        helpText
        type
        ... on MultipleChoiceQuestion {
          isOtherAllowed
          validationRule {
            type
            number
          }
          choices(randomize: true) {
            id
            title
            description
            color
            image {
              url
            }
          }
        }
      }
    }
  `,
});
