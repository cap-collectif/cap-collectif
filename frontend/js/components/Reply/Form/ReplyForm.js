// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';
import {
  change as changeRedux,
  Field,
  FieldArray,
  formValueSelector,
  reduxForm,
  SubmissionError,
} from 'redux-form';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import memoize from 'lodash/memoize';
import type { Dispatch, GlobalState } from '~/types';
import type { ReplyForm_questionnaire } from '~relay/ReplyForm_questionnaire.graphql';
import type { ReplyForm_reply } from '~relay/ReplyForm_reply.graphql';
import renderComponent from '~/components/Form/Field';
import type { ResponsesInReduxForm } from '~/components/Form/Form.type';
import { TYPE_FORM } from '~/constants/FormConstants';
import SubmitButton from '~/components/Form/SubmitButton';
import AlertForm from '~/components/Alert/AlertForm';
import AddReplyMutation from '~/mutations/AddReplyMutation';
import UpdateReplyMutation from '~/mutations/UpdateReplyMutation';
import AppDispatcher from '~/dispatchers/AppDispatcher';
import { UPDATE_ALERT, TYPE_ALERT } from '~/constants/AlertConstants';
import Description from '~/components/Ui/Form/Description/Description';
import ReplyFormContainer from './ReplyForm.style';
import validateResponses from '~/utils/form/validateResponses';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import renderResponses from '~/components/Form/RenderResponses';

type Props = {|
  ...ReduxFormFormProps,
  +questionnaire: ReplyForm_questionnaire,
  +reply: ?ReplyForm_reply,
  +responses: ResponsesInReduxForm,
  +user: ?Object,
  +intl: IntlShape,
  +history: History,
  +setIsEditingReplyForm?: (isEditing: boolean) => void,
  +setIsShow?: (show: boolean) => void,
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

const memoizeAvailableQuestions: any = memoize(() => {});

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { questionnaire, reply, history, setIsShow } = props;
  const data = {};

  data.responses = formatSubmitResponses(values.responses, questionnaire.questions);
  data.draft = values.draft;

  if (reply) {
    data.replyId = reply.id;

    return UpdateReplyMutation.commit({
      input: {
        replyId: reply.id,
        responses: data.responses,
        draft: typeof values.draft !== 'undefined' ? values.draft : reply.draft,
      },
    })
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            type: TYPE_ALERT.SUCCESS,
            content: values.draft
              ? 'your-answer-has-been-saved-as-a-draft'
              : 'reply.request.create.success',
          },
        });
        // $FlowFixMe react-router-dom is not typed
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

      if (setIsShow) setIsShow(false);
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = (values: FormValues, props: Props) => {
  const availableQuestions: Array<string> = memoizeAvailableQuestions.cache.get(
    'availableQuestions',
  );
  const { questions } = props.questionnaire;
  const { responses } = values;
  const errors = {};

  const responsesError = validateResponses(
    questions,
    responses,
    'reply',
    props.intl,
    values.draft,
    availableQuestions,
  );

  if (responsesError.responses && responsesError.responses.length) {
    errors.responses = responsesError.responses;
  }

  return errors;
};

export const formName = 'ReplyForm';

export const getFormNameUpdate = (id: string) => `Update${formName}-${id}`;

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
      (!questionnaire?.viewerReplies?.totalCount === 0 &&
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
    const availableQuestions = memoizeAvailableQuestions.cache.get('availableQuestions');
    const disabled = this.formIsDisabled();
    const isDraft = reply && reply.draft;

    return (
      <ReplyFormContainer id="reply-form-container">
        {questionnaire.description && <Description>{questionnaire.description}</Description>}

        <form id="reply-form" onSubmit={handleSubmit}>
          <FieldArray
            typeForm={TYPE_FORM.QUESTIONNAIRE}
            name="responses"
            change={change}
            responses={responses}
            form={form}
            component={renderResponses}
            questions={questionnaire.questions}
            intl={intl}
            disabled={disabled}
            reply={reply}
            availableQuestions={availableQuestions}
            memoize={memoizeAvailableQuestions}
          />

          {questionnaire.anonymousAllowed && (
            <>
              <hr className="mb-30" />
              <Field
                typeForm={TYPE_FORM.QUESTIONNAIRE}
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
                <ButtonGroup className="btn-group">
                  <SubmitButton
                    type="submit"
                    id={`${form}-submit-create-draft-reply`}
                    disabled={pristine || submitting || disabled}
                    bsStyle="primary"
                    label={submitting ? 'global.loading' : 'global.save_as_draft'}
                    onSubmit={() => dispatch(changeRedux(form, 'draft', true))}
                  />
                </ButtonGroup>
              )}
              <ButtonGroup className="btn-group">
                <SubmitButton
                  type="submit"
                  id={`${form}-submit-create-reply`}
                  bsStyle="info"
                  disabled={(!isDraft && pristine) || invalid || submitting || disabled}
                  label={submitting ? 'global.loading' : 'global.publish'}
                  onSubmit={() => dispatch(changeRedux(form, 'draft', false))}
                />
              </ButtonGroup>
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
      </ReplyFormContainer>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const { reply, questionnaire } = props;

  const defaultResponses = formatInitialResponsesValues(
    questionnaire.questions,
    reply ? reply.responses : [],
  );

  return {
    responses:
      formValueSelector(reply ? getFormNameUpdate(reply.id) : `Create${formName}`)(
        state,
        'responses',
      ) || defaultResponses,
    initialValues: {
      responses: defaultResponses,
      draft: reply ? reply.draft : true,
      private: reply ? reply.private : false,
    },
    user: state.user.user,
    form: reply ? getFormNameUpdate(reply.id) : `Create${formName}`,
  };
};

const form = reduxForm({
  onSubmit,
  validate,
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
        totalCount
        edges {
          node {
            id
          }
        }
      }
      questions {
        id
        ...responsesHelper_question @relay(mask: false)
      }
    }
  `,
});
