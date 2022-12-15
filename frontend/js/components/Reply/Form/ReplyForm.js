// @flow
import * as React from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import {
  change as changeRedux,
  stopSubmit,
  Field,
  FieldArray,
  formValueSelector,
  getFormSyncErrors,
  isInvalid,
  reduxForm,
  setSubmitFailed,
  submit,
} from 'redux-form';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import memoize from 'lodash/memoize';
import css from '@styled-system/css';
import debounce from 'debounce-promise';
import { toast, Text } from '@cap-collectif/ui';
import type { Dispatch, GlobalState } from '~/types';
import type { ReplyForm_questionnaire } from '~relay/ReplyForm_questionnaire.graphql';
import type { ReplyForm_reply } from '~relay/ReplyForm_reply.graphql';
import renderComponent from '~/components/Form/Field';
import type { ResponsesInReduxForm } from '~/components/Form/Form.type';
import { TYPE_FORM } from '~/constants/FormConstants';
import SubmitButton from '~/components/Form/SubmitButton';
import AlertForm from '~/components/Alert/AlertForm';
import AddUserReplyMutation from '~/mutations/AddUserReplyMutation';
import UpdateUserReplyMutation from '~/mutations/UpdateUserReplyMutation';
import AddAnonymousReplyMutation from '~/mutations/AddAnonymousReplyMutation';
import UpdateAnonymousReplyMutation from '~/mutations/UpdateAnonymousReplyMutation';
import {
  ReplyFormContainer,
  ParticipantEmailWrapper,
  QuestionnaireContainer,
  WrapperWithMarge,
  ButtonGroupSubmit,
  WrapperWithMargeX,
} from './ReplyForm.style';
import validateResponses from '~/utils/form/validateResponses';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import renderResponses from '~/components/Form/RenderResponses';
import { analytics } from '~/startup/analytics';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import RequirementsFormLegacy, {
  formName as RequirementsFormLegacyName,
} from '~/components/Requirements/RequirementsFormLegacy';
import CookieMonster from '~/CookieMonster';
import { isEmail } from '~/services/Validator';
import Captcha from '~/components/Form/Captcha';
import { SPACES_SCALES } from '~/styles/theme/base';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { getAvailabeQuestionsCacheKey } from '~/utils/questionsCacheKey';
import Section from '~/components/Form/Section/Section';
import SectionTitle from '~ui/Form/Section/SectionTitle';

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
  +invalidRequirements: boolean,
  +platformName: string,
  +isAnonymousReply: boolean,
  +anonymousRepliesIds: string[],
  +isAuthenticated: boolean,
  +isAnonymousQuestionnaireFeatureEnabled: boolean,
  +backgroundColorSection: string,
|};

type FormValues = {|
  +responses: ResponsesInReduxForm,
  +private: boolean,
  +draft: boolean,
  +participantEmail?: string,
|};

type State = {|
  +captcha: {|
    visible: boolean,
    value: ?string,
  |},
|};

type ReactObjRef<ElementType: React.ElementType> = {
  current: null | React.ElementRef<ElementType>,
};

export const formName = 'ReplyForm';

const onUnload = e => {
  // $FlowFixMe voir https://github.com/facebook/flow/issues/3690
  e.returnValue = true;
};

const memoizeAvailableQuestions: any = memoize(() => {});

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props, state: GlobalState) => {
  const {
    questionnaire,
    reply,
    history,
    setIsShow,
    isAnonymousReply,
    anonymousRepliesIds,
    isAuthenticated,
    intl,
  } = props;
  const data = {};

  data.responses = formatSubmitResponses(values.responses, questionnaire.questions);
  data.draft = values.draft;

  if (questionnaire.anonymousAllowed) {
    data.private = values.private;
  }

  if (reply) {
    data.replyId = reply.id;

    if (isAnonymousReply) {
      const hashedToken = CookieMonster.getHashedAnonymousReplyCookie(questionnaire.id, reply.id);
      if (!hashedToken) return;
      data.participantEmail = values.participantEmail;

      return UpdateAnonymousReplyMutation.commit({
        input: {
          hashedToken,
          responses: data.responses,
          participantEmail: data.participantEmail,
        },
      })
        .then(() => {
          toast({
            variant: 'success',
            content: intl.formatHTMLMessage({
              id: values.draft
                ? 'your-answer-has-been-saved-as-a-draft'
                : 'reply.request.create.success',
            }),
          });
          // $FlowFixMe react-router-dom is not typed
          history.replace('/');
        })
        .catch(() => {
          mutationErrorToast(intl);
        });
    }

    return UpdateUserReplyMutation.commit({
      input: {
        replyId: reply.id,
        responses: data.responses,
        private: data.private,
        draft: typeof values.draft !== 'undefined' ? values.draft : !!reply.draft,
      },
    })
      .then(() => {
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: values.draft
              ? 'your-answer-has-been-saved-as-a-draft'
              : 'reply.request.create.success',
          }),
        });
        // $FlowFixMe react-router-dom is not typed
        history.replace('/');
      })
      .catch(() => {
        mutationErrorToast(intl);
      });
  }
  data.questionnaireId = questionnaire.id;

  if (questionnaire.anonymousAllowed) {
    data.private = values.private;
  }

  if (!isAuthenticated) {
    return AddAnonymousReplyMutation.commit({
      input: {
        questionnaireId: data.questionnaireId,
        responses: data.responses,
        participantEmail: values?.participantEmail,
      },
      isAuthenticated: false,
      anonymousRepliesIds,
    })
      .then(response => {
        const anonymousReply = response.addAnonymousReply;
        if (
          anonymousReply?.token &&
          anonymousReply?.reply?.id &&
          anonymousReply.questionnaire?.id
        ) {
          CookieMonster.addAnonymousReplyCookie(anonymousReply.questionnaire.id, {
            token: anonymousReply.token,
            replyId: anonymousReply.reply.id,
          });
        }
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: 'reply.request.create.success',
          }),
        });

        if (setIsShow) setIsShow(false);
      })
      .catch(() => {
        mutationErrorToast(intl);
      });
  }

  return AddUserReplyMutation.commit({
    input: {
      questionnaireId: data.questionnaireId,
      responses: data.responses,
      private: data.private,
      draft: data.draft,
    },
    isAuthenticated: true,
  })
    .then(response => {
      if (
        response.addUserReply?.errorCode &&
        response.addUserReply?.errorCode === 'REQUIREMENTS_NOT_MET'
      ) {
        toast({
          variant: 'danger',
          content: intl.formatMessage({ id: 'add_reply_requirements_not_met' }),
        });

        setSubmitFailed(formName)(state);
        return;
      }
      toast({
        variant: 'success',
        content: intl.formatHTMLMessage({
          id: values.draft
            ? 'your-answer-has-been-saved-as-a-draft'
            : 'reply.request.create.success',
        }),
      });

      if (setIsShow) setIsShow(false);
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

const validate = (values: FormValues, props: Props) => {
  const availableQuestions: Array<string> = memoizeAvailableQuestions.cache.get(
    getAvailabeQuestionsCacheKey(props.questionnaire.id),
  );
  const { intl } = props;
  const { questions } = props.questionnaire;
  const { responses } = values;
  const errors = {};

  const responsesError = validateResponses(
    questions,
    responses,
    'reply',
    intl,
    values.draft,
    availableQuestions,
  );

  if (responsesError.responses && responsesError.responses.length) {
    errors.responses = responsesError.responses;
  }

  return errors;
};

const asyncValidate = (values: FormValues) => {
  return new Promise((resolve, reject) => {
    const errors = {};
    if (values.participantEmail && !isEmail(values.participantEmail)) {
      errors.participantEmail = 'email.wrong.format';
      return reject(errors);
    }
    return resolve();
  });
};

export const getFormNameUpdate = (id: string) => `Update${formName}-${id}`;

export class ReplyForm extends React.Component<Props, State> {
  formRef: ReactObjRef<'form'>;

  constructor() {
    super();
    this.state = {
      captcha: {
        visible: true,
        value: null,
      },
    };
    this.formRef = React.createRef();
  }

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

  submitReply(
    reply: ?ReplyForm_reply,
    questionnaire: ReplyForm_questionnaire,
    form: string,
    dispatch: Dispatch,
  ) {
    analytics.track('submit_reply_click', {
      stepName: questionnaire.step?.title || '',
    });
    dispatch(stopSubmit(form));
    Promise.resolve(dispatch(changeRedux(form, 'draft', false))).then(() => {
      dispatch(submit(form));
    });
  }

  formIsDisabled() {
    const { questionnaire, user, reply, isAnonymousQuestionnaireFeatureEnabled } = this.props;

    const canParticipateAnonymously = isAnonymousQuestionnaireFeatureEnabled
      ? questionnaire?.step?.isAnonymousParticipationAllowed
      : false;

    if (!canParticipateAnonymously) {
      return (
        !questionnaire.contribuable ||
        !user ||
        (questionnaire.phoneConfirmationRequired && !user.isPhoneConfirmed) ||
        (!questionnaire?.viewerReplies?.totalCount === 0 &&
          !questionnaire.multipleRepliesAllowed &&
          !reply)
      );
    }

    if (questionnaire.contribuable) {
      return false;
    }

    if (canParticipateAnonymously) {
      return true;
    }
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
      isAnonymousReply,
      user,
      invalidRequirements,
      platformName,
      isAuthenticated,
      isAnonymousQuestionnaireFeatureEnabled,
      backgroundColorSection,
    } = this.props;

    const availableQuestions = memoizeAvailableQuestions.cache.get(
      getAvailabeQuestionsCacheKey(questionnaire.id),
    );
    const disabled = this.formIsDisabled();
    const isDraft = reply && reply.draft;

    const newReplyOrReplyInDraft = !reply || reply.draft;
    const viewerMeetsTheRequirements =
      questionnaire.step?.requirements?.viewerMeetsTheRequirements || false;

    const replyIsPublished = reply && !reply.draft;
    const stepHasRequirement =
      questionnaire.step?.requirements && questionnaire.step.requirements.totalCount > 0;

    const canParticipateAnonymously = isAnonymousQuestionnaireFeatureEnabled
      ? questionnaire?.step?.isAnonymousParticipationAllowed
      : false;

    const disabledSubmitBtn = () => {
      const isNativeFormValid = this.formRef.current?.reportValidity() ?? true;
      const isDisabled =
        invalidRequirements ||
        invalid ||
        submitting ||
        disabled ||
        (!isDraft && pristine) ||
        !isNativeFormValid;
      if (!isAuthenticated && !reply) {
        return isDisabled || !this.state.captcha.value;
      }
      return isDisabled;
    };

    const canContributeAnonymously =
      this.state.captcha.visible &&
      !isAuthenticated &&
      !reply &&
      canParticipateAnonymously &&
      questionnaire.contribuable;

    const hasFilledRequirements = reply && viewerMeetsTheRequirements;

    return (
      <QuestionnaireContainer id="reply-form" onSubmit={handleSubmit} ref={this.formRef}>
        {questionnaire.description && (
          <WYSIWYGRender className="questionnaire__description" value={questionnaire.description} />
        )}

        <ReplyFormContainer id="reply-form-container">
          {(newReplyOrReplyInDraft || replyIsPublished) &&
            stepHasRequirement &&
            user &&
            !hasFilledRequirements && (
              <>
                <Section level={0} typeForm={TYPE_FORM.QUESTIONNAIRE}>
                  <FormattedMessage id="requirements" />
                </Section>

                <WrapperWithMarge
                  overflow="hidden"
                  borderBottom={
                    questionnaire.questions[0].__typename !== 'SectionQuestion'
                      ? `2px solid ${backgroundColorSection}`
                      : 'none'
                  }>
                  {questionnaire.step?.requirements?.reason && (
                    <WYSIWYGRender value={questionnaire.step?.requirements?.reason} />
                  )}

                  <RequirementsFormLegacy
                    step={questionnaire.step}
                    stepId={questionnaire.step?.id}
                  />
                </WrapperWithMarge>
              </>
            )}

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
            divClassName="container-questions"
            availableQuestions={availableQuestions}
            memoize={memoizeAvailableQuestions}
            unstable__enableCapcoUiDs
            memoizeId={questionnaire.id}
          />

          {!isAuthenticated &&
            questionnaire.step?.collectParticipantsEmail &&
            canParticipateAnonymously && (
              <>
                <SectionTitle typeForm={TYPE_FORM.QUESTIONNAIRE}>
                  <FormattedMessage id="youre-almost-there" />
                </SectionTitle>

                <ParticipantEmailWrapper mb={4}>
                  <Text fontSize="20px" color="gray.900" fontWeight={600} fontFamily="inherit">
                    {intl.formatMessage({ id: 'your-email-address' })}
                  </Text>
                  <Text color="gray.800" fontFamily="inherit">
                    {intl.formatMessage(
                      { id: 'anonymous.questionnaire.collect.email.help' },
                      { platform: platformName },
                    )}
                  </Text>
                  <Field
                    type="text"
                    name="participantEmail"
                    helpPrint={false}
                    component={renderComponent}
                    disabled={disabled}
                  />
                  <Text color="neutral.gray.700" fontFamily="inherit">
                    {intl.formatMessage(
                      { id: 'information-for-the-newsletter-registration-form' },
                      {
                        organisationName: platformName,
                      },
                    )}
                  </Text>
                </ParticipantEmailWrapper>
              </>
            )}

          {questionnaire.anonymousAllowed && !!user && (
            <>
              <hr className="mb-30" />

              <WrapperWithMargeX>
                <Field
                  typeForm={TYPE_FORM.QUESTIONNAIRE}
                  type="checkbox"
                  name="private"
                  helpPrint={false}
                  id={`${form}-reply-private`}
                  component={renderComponent}
                  disabled={disabled}>
                  <FormattedMessage id="reply.form.private" />
                </Field>
              </WrapperWithMargeX>
            </>
          )}

          {canContributeAnonymously && (
            <WrapperWithMargeX
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              pb="32px">
              <Text
                css={css({
                  mb: `${SPACES_SCALES[6]} !important`,
                })}
                textAlign="center"
                className="recaptcha-message"
                color="neutral-gray.700">
                {intl.formatMessage({ id: 'captcha.check' })}
              </Text>
              <Captcha
                style={{ transformOrigin: 'center' }}
                value={this.state.captcha.value}
                onChange={value => {
                  this.setState(state => ({
                    captcha: { ...state.captcha, value },
                  }));
                }}
              />
            </WrapperWithMargeX>
          )}
        </ReplyFormContainer>

        {(!reply || reply.viewerCanUpdate || isAnonymousReply) && (
          <ButtonGroupSubmit className="btn-toolbar">
            {(!reply || isDraft) && questionnaire.type === 'QUESTIONNAIRE' && !!user && (
              <SubmitButton
                type="submit"
                id={`${form}-submit-create-draft-reply`}
                disabled={pristine || submitting || disabled || invalidRequirements}
                bsStyle="primary"
                label={submitting ? 'global.loading' : 'global.save_as_draft'}
                onSubmit={() => {
                  analytics.track('submit_draft_reply_click', {
                    stepName: questionnaire.step?.title || '',
                  });
                  dispatch(changeRedux(form, 'draft', true));
                }}
              />
            )}
            <SubmitButton
              type="submit"
              id={`${form}-submit-create-reply`}
              bsStyle="info"
              disabled={disabledSubmitBtn()}
              label={submitting ? 'global.loading' : 'global.send'}
              onSubmit={() => {
                this.submitReply(reply, questionnaire, form, dispatch);
              }}
            />
          </ButtonGroupSubmit>
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
      </QuestionnaireContainer>
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
      participantEmail: reply ? reply.participantEmail : null,
    },
    user: state.user.user,
    isAuthenticated: !!state.user.user,
    form: reply ? getFormNameUpdate(reply.id) : `Create${formName}`,
    isAnonymousQuestionnaireFeatureEnabled:
      state.default.features.unstable__anonymous_questionnaire,
    invalidRequirements:
      isInvalid(RequirementsFormLegacyName)(state) ||
      Object.keys(getFormSyncErrors(RequirementsFormLegacyName)(state)).length > 0,
    platformName: state.default.parameters['global.site.fullname'],
    backgroundColorSection: state.default.parameters['color.section.bg'],
  };
};

const form = reduxForm({
  onSubmit,
  validate,
  asyncValidate: debounce(asyncValidate, 1000),
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ReplyForm);

const container = connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(form));

const containerWithRouter = withRouter(container);

export default createFragmentContainer(containerWithRouter, {
  reply: graphql`
    fragment ReplyForm_reply on Reply
    @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      id
      ... on UserReply {
        draft
        private
        viewerCanUpdate
      }
      ... on AnonymousReply {
        participantEmail
      }
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
      step {
        id
        title
        ...RequirementsFormLegacy_step @arguments(isAuthenticated: $isAuthenticated)
        ... on RequirementStep {
          requirements {
            reason
            totalCount
            viewerMeetsTheRequirements @include(if: $isAuthenticated)
          }
        }
        isAnonymousParticipationAllowed
        collectParticipantsEmail
      }
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
