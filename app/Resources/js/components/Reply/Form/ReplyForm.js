// @flow
import * as React from 'react';
import {FormattedMessage, injectIntl, type IntlShape} from 'react-intl';
import {
  change as changeRedux,
  Field,
  FieldArray,
  type FormProps,
  formValueSelector,
  reduxForm,
  SubmissionError,
} from 'redux-form';
import {connect} from 'react-redux';
import {createFragmentContainer, graphql} from 'react-relay';
import type {Dispatch, State} from '../../../types';
import type {ReplyForm_questionnaire} from './__generated__/ReplyForm_questionnaire.graphql';
import type {ReplyForm_reply} from './__generated__/ReplyForm_reply.graphql';
import {
  formatInitialResponsesValues,
  formatSubmitResponses,
  renderResponses,
  type ResponsesInReduxForm,
  validateResponses,
} from '../../../utils/responsesHelper';
import renderComponent from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import AddReplyMutation from '../../../mutations/AddReplyMutation';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import {CardContainer} from '../../Ui/Card/CardContainer';
import UpdateReplyMutation from '../../../mutations/UpdateReplyMutation';
import SubmitButton from '../../Form/SubmitButton';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {|
  ...FormProps,
  +questionnaire: ReplyForm_questionnaire,
  +reply: ?ReplyForm_reply,
  +responses: ResponsesInReduxForm,
  +user: ?Object,
  +intl: IntlShape,
  +onClose?: () => void,
|};

type FormValues = {|
  responses: ResponsesInReduxForm,
  private: boolean,
  draft: boolean,
|};

const onUnload = e => {
  e.returnValue = true;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const {questionnaire, reply, onClose} = props;
  const data = {};

  data.responses = formatSubmitResponses(values.responses, questionnaire.questions);
  data.draft = values.draft;
  if (reply) {
    data.replyId = reply.id;
    return UpdateReplyMutation.commit({
      input: {
        replyId: data.replyId,
        responses: data.responses,
        draft: data.draft,
      }
    })
      .then(() => {
        AppDispatcher.dispatch({
          actionType: 'UPDATE_ALERT',
          alert: {
            bsStyle: 'success',
            content: data.draft
              ? 'your-answer-has-been-saved-as-a-draft'
              : 'reply.request.create.success',
          },
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

  return AddReplyMutation.commit({
    input: {
      questionnaireId: data.questionnaireId,
      responses: data.responses,
      private: data.private,
      draft: data.draft,
    }, isAuthenticated: true
  })
    .then(() => {
      AppDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: {
          bsStyle: 'success',
          content: data.draft
            ? 'your-answer-has-been-saved-as-a-draft'
            : 'reply.request.create.success',
        },
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
  const {questions} = props.questionnaire;
  const {responses} = values;
  const errors = {};

  const responsesError = validateResponses(questions, responses, 'reply', props.intl);
  if (values.draft) {
    return errors;
  }
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

  componentDidUpdate(prevProps: Props) {
    if (prevProps.dirty === false && this.props.dirty === true) {
      window.addEventListener('beforeunload', onUnload);
    }

    if (this.props.dirty === false) {
      window.removeEventListener('beforeunload', onUnload);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', onUnload);
  }

  formIsDisabled() {
    const {questionnaire, user, reply} = this.props;

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
      dispatch,
      reply,
    } = this.props;
    const disabled = this.formIsDisabled();
    const isDraft = reply && reply.draft;
    return (
      <CardContainer>
        <div className="card__body">
          <div id="create-reply-form">
            <form id="reply-form" ref="form" onSubmit={handleSubmit}>
              {questionnaire.description && (
                <div className="mb-15">
                  <WYSIWYGRender value={questionnaire.description}/>
                </div>
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
                reply={reply}
              />
              {questionnaire.anonymousAllowed && (
                <div>
                  <hr className="mb-30"/>
                  <Field
                    type="checkbox"
                    name="private"
                    helpPrint={false}
                    id={`${form}-reply-private`}
                    component={renderComponent}
                    children={<FormattedMessage id="reply.form.private"/>}
                    disabled={disabled}
                  />
                </div>
              )}
              {(!reply || reply.viewerCanUpdate) && (
                <div className="btn-toolbar btn-box sticky">
                  {(!reply || isDraft) && questionnaire.type === 'QUESTIONNAIRE' && (
                    <div className="btn-group">
                      <SubmitButton
                        type="submit"
                        id={`${form}-submit-create-draft-reply`}
                        disabled={pristine || submitting || disabled}
                        bsStyle="primary"
                        label={submitting ? 'global.loading' : 'global.save_as_draft'}
                        onSubmit={() => {
                          dispatch(changeRedux(form, 'draft', true));
                        }}
                      />
                    </div>
                  )}
                  <div className="btn-group">
                    <SubmitButton
                      type="submit"
                      id={`${form}-submit-create-reply`}
                      bsStyle="info"
                      disabled={(!isDraft && pristine) || invalid || submitting || disabled}
                      label={submitting ? 'global.loading' : 'validate'}
                      onSubmit={() => {
                        dispatch(changeRedux(form, 'draft', false));
                      }}
                    />
                  </div>
                </div>
              )}
              {!disabled && !pristine && (
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

const mapStateToProps = (state: State, props: Props) => ({
  responses: formValueSelector(
    props.reply ? `Update${formName}-${props.reply.id}` : `Create${formName}`,
  )(state, 'responses'),
  initialValues: {
    responses: formatInitialResponsesValues(
      props.questionnaire.questions,
      props.reply ? props.reply.responses : [],
    ),
    draft: props.reply && props.reply.draft ? props.reply.draft : false,
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
      publicationStatus
      draft
      viewerCanUpdate
      responses {
        ...responsesHelper_response @relay(mask: false)
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
      type
      viewerReplies @include(if: $isAuthenticated) {
        id
      }
      title
      id
      questions {
        id
        ...responsesHelper_question @relay(mask: false)
      }
    }
  `,
});
