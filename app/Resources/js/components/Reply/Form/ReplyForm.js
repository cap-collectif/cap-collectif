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
  validateResponses
} from '../../../utils/responsesHelper';
import renderComponent from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import AddReplyMutation from '../../../mutations/AddReplyMutation';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import { CardContainer } from '../../Ui/Card/CardContainer';
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
  const { questions } = props.questionnaire;
  const { responses } = values;
  const errors = {};

  const responsesError = validateResponses(questions, responses, 'reply', props.intl);

  if (responsesError.responses && responsesError.responses.length) {
    errors.responses = responsesError.responses;
  }
  return errors;
};

export const formName = 'ReplyForm';

export class ReplyForm extends React.Component<Props> {
  static defaultProps = {
    reply: null,
  };

  formIsDisabled() {
    const { questionnaire, user, reply } = this.props;

    return (
      !questionnaire.contribuable ||
      !user ||
      (questionnaire.phoneConfirmationRequired && !user.isPhoneConfirmed) ||
      (questionnaire.viewerReplies &&
        questionnaire.viewerReplies.length > 0 &&
        !questionnaire.multipleRepliesAllowed &&
        !reply)
    );
  }

  render() {
    const {
      intl,
      questionnaire,
      submitting,
      pristine,
      invalid,
      form,
      valid,
      change,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      responses,
    } = this.props;

    const disabled = this.formIsDisabled();

    return (
      <CardContainer>
        <div className="card__body">
          <div id="create-reply-form">
            <form id="reply-form" ref="form" onSubmit={handleSubmit}>
              {questionnaire.description && (
                <p dangerouslySetInnerHTML={{ __html: questionnaire.description }} />
              )}
              <FieldArray
                name="responses"
                change={change}
                responses={responses}
                form={form}
                component={renderResponses}
                questions={questionnaire.questions}
                intl={intl}
                disabled={disabled}
              />
              {questionnaire.anonymousAllowed && (
                <div>
                  <hr className="mb-30" />
                  <Field
                    type="checkbox"
                    name="private"
                    id={`${form}-reply-private`}
                    component={renderComponent}
                    children={<FormattedMessage id="reply.form.private" />}
                    disabled={disabled}
                  />
                </div>
              )}
              <Button
                type="submit"
                id={`${form}-submit-create-reply`}
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
        </div>
      </CardContainer>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  responses: formValueSelector(
    props.reply ? `Update${formName}-${props.reply.id}` : `Create${formName}`,
  )(state, 'responses'),
  initialValues: {
    responses: formatInitialResponsesValues(
      props.questionnaire.questions,
      props.reply ? props.reply.responses : [],
    ),
    private: props.reply ? props.reply.private : false,
  },
  user: state.user.user,
  form: props.reply ? `Update${formName}-${props.reply.id}` : `Create${formName}`,
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
        position
        private
        required
        description
        helpText
        jumps {
          id
          always
          destination {
            id
            title
          }
          conditions {
            id
            operator
            question {
              id
              title
            }
            ... on MultipleChoiceQuestionLogicJumpCondition {
              value {
                id
                title
              }
            }
          }
        }
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
