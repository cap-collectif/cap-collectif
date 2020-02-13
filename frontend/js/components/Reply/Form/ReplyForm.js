// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import {
  change as changeRedux,
  Field,
  FieldArray,
  formValueSelector,
  reduxForm,
  SubmissionError,
} from 'redux-form';
import { withRouter, type History } from 'react-router-dom';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import type { Dispatch, State } from '~/types';
import type { ReplyForm_questionnaire } from '~relay/ReplyForm_questionnaire.graphql';
import type { ReplyForm_reply } from '~relay/ReplyForm_reply.graphql';
import {
  formatInitialResponsesValues,
  formatSubmitResponses,
  renderResponses,
  type ResponsesInReduxForm,
  validateResponses,
} from '~/utils/responsesHelper';
import renderComponent from '~/components/Form/Field';
import SubmitButton from '~/components/Form/SubmitButton';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import AlertForm from '~/components/Alert/AlertForm';
import AddReplyMutation from '~/mutations/AddReplyMutation';
import UpdateReplyMutation from '~/mutations/UpdateReplyMutation';
import AppDispatcher from '~/dispatchers/AppDispatcher';
import { Card } from '~/components/Ui/Card/Card';
import { UPDATE_ALERT, TYPE_ALERT } from '~/constants/AlertConstants';

type Props = {|
  ...ReduxFormFormProps,
  +questionnaire: ReplyForm_questionnaire,
  +reply: ?ReplyForm_reply,
  +responses: ResponsesInReduxForm,
  +user: ?Object,
  +intl: IntlShape,
  +history: History,
  +setIsEditingReplyForm?: (isEditing: boolean) => void,
|};

type FormValues = {|
  responses: ResponsesInReduxForm,
  private: boolean,
  draft: boolean,
|};

const onUnload = e => {
  // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
  e.returnValue = true;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { questionnaire, reply, history } = props;
  const data = {};

  data.responses = formatSubmitResponses(values.responses, questionnaire.questions);
  data.draft = values.draft;

  if (reply) {
    data.replyId = reply.id;

    return UpdateReplyMutation.commit({
      input: {
        replyId: reply.id,
        responses: data.responses,
        draft: reply.draft,
      },
    })
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.SUCCESS,
            content: reply.draft
              ? 'your-answer-has-been-saved-as-a-draft'
              : 'reply.request.create.success',
          },
        });

        history.replace('/');
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
    },
    isAuthenticated: true,
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
  const responsesError = validateResponses(questions, responses, 'reply', props.intl, values.draft);

  if (responsesError.responses && responsesError.responses.length) {
    errors.responses = responsesError.responses;
  }

  return errors;
};

export const formName = 'ReplyForm';

export const formNameUpdate = (id: string) => `Update${formName}-${id}`;

export class ReplyForm extends React.Component<Props> {
  static defaultProps = {
    reply: null,
  };

  componentDidUpdate(prevProps: Props) {
    const { dirty, setIsEditingReplyForm } = this.props;

    if (prevProps.dirty === false && dirty === true) {
      window.addEventListener('beforeunload', onUnload);
    }

    if (dirty) {
      if (setIsEditingReplyForm) setIsEditingReplyForm(true);
    }

    if (!dirty) {
      window.removeEventListener('beforeunload', onUnload);

      if (setIsEditingReplyForm) setIsEditingReplyForm(false);
    }
  }

  componentWillUnmount() {
    const { setIsEditingReplyForm } = this.props;

    window.removeEventListener('beforeunload', onUnload);
    if (setIsEditingReplyForm) setIsEditingReplyForm(false);
  }

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
      dispatch,
      reply,
    } = this.props;
    const disabled = this.formIsDisabled();
    const isDraft = reply && reply.draft;

    return (
      <Card>
        <Card.Body>
          <div id="create-reply-form">
            <form id="reply-form" ref="form" onSubmit={handleSubmit}>
              {questionnaire.description && (
                <div className="mb-15">
                  <WYSIWYGRender value={questionnaire.description} />
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
                <>
                  <hr className="mb-30" />
                  <Field
                    type="checkbox"
                    name="private"
                    helpPrint={false}
                    id={`${form}-reply-private`}
                    component={renderComponent}
                    children={<FormattedMessage id="reply.form.private" />}
                    disabled={disabled}
                  />
                </>
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
                        onSubmit={() => dispatch(changeRedux(form, 'draft', true))}
                      />
                    </div>
                  )}
                  <div className="btn-group">
                    <SubmitButton
                      type="submit"
                      id={`${form}-submit-create-reply`}
                      bsStyle="info"
                      disabled={(!isDraft && pristine) || invalid || submitting || disabled}
                      label={submitting ? 'global.loading' : 'global.save'}
                      onSubmit={() => dispatch(changeRedux(form, 'draft', false))}
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
        </Card.Body>
      </Card>
    );
  }
}

const mapStateToProps = (state: State, props: Props) => {
  const { reply, questionnaire } = props;

  const defaultResponses = formatInitialResponsesValues(
    questionnaire.questions,
    reply ? reply.responses : [],
  );

  return {
    responses:
      formValueSelector(reply ? formNameUpdate(reply.id) : `Create${formName}`)(
        state,
        'responses',
      ) || defaultResponses,
    initialValues: {
      responses: defaultResponses,
      draft: reply && reply.draft ? reply.draft : true,
      private: reply ? reply.private : false,
    },
    user: state.user.user,
    form: reply ? formNameUpdate(reply.id) : `Create${formName}`,
  };
};

const form = reduxForm({
  validate,
  onSubmit,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ReplyForm);

const container = connect(mapStateToProps)(injectIntl(form));

const containerWithRouter = withRouter(container);

export default createFragmentContainer(containerWithRouter, {
  reply: graphql`
    fragment ReplyForm_reply on Reply
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      id
      private
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
      id
      anonymousAllowed
      description
      multipleRepliesAllowed
      phoneConfirmationRequired
      contribuable
      type
      viewerReplies @include(if: $isAuthenticated) {
        id
      }
      questions {
        id
        ...responsesHelper_question @relay(mask: false)
      }
    }
  `,
});
