import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, injectIntl } from 'react-intl'
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
  change,
  getFormValues,
  SubmissionError,
} from 'redux-form'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { createFragmentContainer, graphql } from 'react-relay'
import memoize from 'lodash/memoize'
import type { Dispatch, GlobalState } from '~/types'
import type { ReplyForm_questionnaire$data } from '~relay/ReplyForm_questionnaire.graphql'
import type { ReplyForm_reply$data } from '~relay/ReplyForm_reply.graphql'
import renderComponent from '~/components/Form/Field'
import type { ResponsesError, ResponsesInReduxForm, ResponsesWarning } from '~/components/Form/Form.type'
import { TYPE_FORM } from '~/constants/FormConstants'
import SubmitButton from '~/components/Form/SubmitButton'
import AlertForm from '~/components/Alert/AlertForm'
import AddUserReplyMutation from '~/mutations/AddUserReplyMutation'
import UpdateUserReplyMutation from '~/mutations/UpdateUserReplyMutation'
import AddAnonymousReplyMutation from '~/mutations/AddAnonymousReplyMutation'
import UpdateAnonymousReplyMutation from '~/mutations/UpdateAnonymousReplyMutation'
import { ReplyFormContainer, QuestionnaireContainer, ButtonGroupSubmit, WrapperWithMargeX } from './ReplyForm.style'
import validateResponses from '~/utils/form/validateResponses'
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues'
import formatSubmitResponses from '~/utils/form/formatSubmitResponses'
import renderResponses from '~/components/Form/RenderResponses'
import { analytics } from '~/startup/analytics'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { formName as RequirementsFormLegacyName } from '~/components/Requirements/RequirementsFormLegacy'
import CookieMonster from '@shared/utils/CookieMonster'
import Captcha from '~/components/Form/Captcha'
import { SPACES_SCALES } from '~/styles/theme/base'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { getAvailabeQuestionsCacheKey } from '~/utils/questionsCacheKey'
import ParticipationWorkflowModal from '../../ParticipationWorkflow/ParticipationWorkflowModal'
import { Box, Text, toast } from '@cap-collectif/ui'
import { css } from 'styled-components'
import { Suspense } from 'react'
import ModalSkeleton from '~/components/ParticipationWorkflow/ModalSkeleton'
import { createPortal } from 'react-dom'

type Props = ReduxFormFormProps & {
  readonly questionnaire: ReplyForm_questionnaire$data
  readonly reply: ReplyForm_reply$data | null | undefined
  readonly responses: ResponsesInReduxForm
  readonly user: Record<string, any> | null | undefined
  readonly intl: IntlShape
  readonly history: History
  readonly setIsEditingReplyForm?: (isEditing: boolean) => void
  readonly setIsShow?: (show: boolean) => void
  readonly invalidRequirements: boolean
  readonly platformName: string
  readonly isAnonymousReply: boolean
  readonly anonymousRepliesIds: string[]
  readonly isAuthenticated: boolean
  readonly backgroundColorSection: string
  readonly backgroundPrimaryButton: string
}
type FormValues = {
  readonly responses: ResponsesInReduxForm
  readonly private: boolean
  readonly draft: boolean
}
type State = {
  readonly captcha: {
    visible: boolean
    value: string | null | undefined
  }
}
type ReactObjRef<ElementType extends React.ElementType> = {
  current: null | React.ElementRef<ElementType>
}

export const formName = 'ReplyForm'

export const onUnload = e => {
  e.returnValue = true
}

const memoizeAvailableQuestions: any = memoize(() => {})

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props, state: GlobalState) => {
  const { questionnaire, reply, history, setIsShow, isAnonymousReply, anonymousRepliesIds, isAuthenticated, intl } =
    props
  const data: any = {}
  data.responses = formatSubmitResponses(values.responses, questionnaire.questions)
  data.draft = values.draft

  const viewerMeetsTheRequirements = questionnaire.step?.requirements?.viewerMeetsTheRequirements || false
  const participantMeetsTheRequirement = questionnaire.step?.requirements?.participantMeetsTheRequirements || false
  const stepHasRequirement = questionnaire.step?.requirements && questionnaire.step.requirements.totalCount > 0
  const skipRequirementsPage =
    !stepHasRequirement || viewerMeetsTheRequirements || participantMeetsTheRequirement || values.draft

  if (questionnaire.anonymousAllowed) {
    data.private = values.private
  }

  if (reply) {
    data.replyId = reply.id

    if (isAnonymousReply) {
      const participantToken = CookieMonster.getHashedAnonymousReplyCookie(questionnaire.id, reply.id)

      if (!participantToken) return
      return UpdateAnonymousReplyMutation.commit({
        input: {
          replyId: reply.id,
          participantToken,
          responses: data.responses,
        },
        isAuthenticated: false,
      })
        .then(response => {
          const { errorCode } = response.updateAnonymousReply

          if (errorCode) {
            throw new SubmissionError({ _error: errorCode })
          }

          if (!skipRequirementsPage) {
            return
          }
          toast({
            variant: 'success',
            content: intl.formatHTMLMessage({
              id: values.draft ? 'draft.create.registered' : 'your-participation-is-confirmed',
            }),
          })
          history.replace('/')
        })
        .catch(error => {
          if (error?.errors?._error === 'PHONE_ALREADY_USED') {
            toast({
              variant: 'danger',
              content: intl.formatMessage({ id: 'phone.already.used.in.this.step' }),
            })
            dispatch(setSubmitFailed(formName)(state))
            return
          }

          mutationErrorToast(intl)
        })
    }

    return UpdateUserReplyMutation.commit({
      input: {
        replyId: reply.id,
        responses: data.responses,
        private: data.private,
        draft: typeof values.draft !== 'undefined' ? values.draft : !!reply.draft,
      },
    })
      .then(response => {
        const { errorCode } = response.updateUserReply
        if (errorCode) {
          throw new SubmissionError({ _error: errorCode })
        }
        if (!skipRequirementsPage) {
          return
        }
        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: values.draft ? 'draft.create.registered' : 'your-participation-is-confirmed',
          }),
        })
        history.replace('/')
      })
      .catch(error => {
        if (error?.errors?._error === 'PHONE_ALREADY_USED') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({ id: 'phone.already.used.in.this.step' }),
          })
          dispatch(setSubmitFailed(formName)(state))
          return
        }

        mutationErrorToast(intl)
      })
  }

  data.questionnaireId = questionnaire.id

  if (questionnaire.anonymousAllowed) {
    data.private = values.private
  }

  if (!isAuthenticated) {
    const participantToken = CookieMonster.getParticipantCookie()

    return AddAnonymousReplyMutation.commit({
      input: {
        questionnaireId: data.questionnaireId,
        responses: data.responses,
        participantToken,
      },
      isAuthenticated: false,
      anonymousRepliesIds,
      skipRequirementsPage,
    })
      .then(response => {
        const anonymousReply = response.addAnonymousReply
        const { errorCode, shouldTriggerConsentInternalCommunication } = anonymousReply
        if (errorCode) {
          throw new SubmissionError({ _error: errorCode })
        }

        if (!anonymousReply || anonymousReply.errorCode) {
          return mutationErrorToast(intl)
        }

        if (anonymousReply?.participantToken && anonymousReply?.reply?.id && anonymousReply.questionnaire?.id) {
          CookieMonster.addParticipantCookie(anonymousReply.participantToken)
          CookieMonster.addAnonymousReplyCookie(anonymousReply.questionnaire.id, {
            token: anonymousReply.participantToken,
            replyId: anonymousReply.reply.id,
          })
        }

        if (!skipRequirementsPage || shouldTriggerConsentInternalCommunication) {
          dispatch(change(props.form, 'id', anonymousReply?.reply?.id))
          return
        }

        toast({
          variant: 'success',
          content: intl.formatHTMLMessage({
            id: 'your-participation-is-confirmed',
          }),
        })

        if (setIsShow) setIsShow(false)
      })
      .catch(error => {
        if (error?.errors?._error === 'PHONE_ALREADY_USED') {
          toast({
            variant: 'danger',
            content: intl.formatMessage({ id: 'phone.already.used.in.this.step' }),
          })
          dispatch(setSubmitFailed(formName)(state))
          return
        }

        mutationErrorToast(intl)
      })
  }

  return AddUserReplyMutation.commit({
    input: {
      questionnaireId: data.questionnaireId,
      responses: data.responses,
      private: data.private,
      draft: data.draft,
    },
  })
    .then(response => {
      const userReply = response.addUserReply
      const { errorCode, shouldTriggerConsentInternalCommunication } = response.addUserReply

      if (errorCode) {
        throw new SubmissionError({ _error: errorCode })
      }

      if (!skipRequirementsPage || shouldTriggerConsentInternalCommunication) {
        dispatch(change(props.form, 'id', userReply?.reply?.id))
        return
      }

      toast({
        variant: 'success',
        content: intl.formatHTMLMessage({
          id: values.draft ? 'draft.create.registered' : 'your-participation-is-confirmed',
        }),
      })

      if (setIsShow) setIsShow(false)
    })
    .catch(error => {
      const errorMap = {
        PHONE_ALREADY_USED: 'phone.already.used.in.this.step',
        REQUIREMENTS_NOT_MET: 'add_reply_requirements_not_met',
        CONTRIBUTION_NOT_ALLOWED: 'participant-already-contributed-title',
      }

      const submissionError = error?.errors?._error

      if (submissionError) {
        toast({
          variant: 'danger',
          content: intl.formatMessage({ id: errorMap[submissionError] }),
        })
        dispatch(setSubmitFailed(formName)(state))
      }

      mutationErrorToast(intl)
    })
}

const validate = (values: FormValues, props: Props) => {
  const availableQuestions: Array<string> = memoizeAvailableQuestions.cache.get(
    getAvailabeQuestionsCacheKey(props.questionnaire.id),
  )
  const { intl } = props
  const { questions } = props.questionnaire
  const { responses } = values
  const errors: { responses: ResponsesError | ResponsesWarning } = { responses: [] }
  const responsesError = validateResponses(questions, responses, 'reply', intl, values.draft, availableQuestions)

  if (responsesError.responses && responsesError.responses.length) {
    errors.responses = responsesError.responses
  }

  if (errors.responses.length !== 0 && errors.responses.some(response => response !== undefined)) {
    scrollToErrors(errors.responses)
  }

  return errors
}

const scrollToErrors = (errors: ResponsesError | ResponsesWarning) => {
  const errIndex = errors.findIndex(val => val !== undefined)
  const element = document.getElementById(`label-CreateReplyForm-responses${errIndex}`)
  if (element) element.scrollIntoView()
}

export const getFormNameUpdate = (id: string) => `Update${formName}-${id}`
export class ReplyForm extends React.Component<Props, State> {
  formRef: ReactObjRef<'form'>

  constructor() {
    super()
    this.state = {
      captcha: {
        visible: true,
        value: null,
      },
    }
    this.formRef = React.createRef()
  }

  static defaultProps = {
    reply: null,
  }

  componentDidUpdate(prevProps: Props) {
    const { questionnaire, replyId, submitSucceeded, isAuthenticated } = this.props
    const { step } = questionnaire
    const participantMeetsTheRequirement = step?.requirements?.participantMeetsTheRequirements || false
    const stepHasRequirement = step?.requirements && step.requirements.totalCount > 0

    const showCaptcha = (!stepHasRequirement || participantMeetsTheRequirement) && !isAuthenticated
    const showRequirementsModal = replyId && !showCaptcha && submitSucceeded

    if (showRequirementsModal) {
      const url = new URL(window.location.href)
      if (!url.searchParams.has('workflow')) {
        url.searchParams.append('workflow', '')
        window.history.pushState({}, '', url)
      }
      window.removeEventListener('beforeunload', onUnload)
    }

    const { dirty, setIsEditingReplyForm } = this.props

    if (prevProps.dirty === false && dirty === true && !showRequirementsModal) {
      window.addEventListener('beforeunload', onUnload)
    }

    if (dirty) {
      if (setIsEditingReplyForm) setIsEditingReplyForm(true)
    }

    if (!dirty) {
      window.removeEventListener('beforeunload', onUnload)
      if (setIsEditingReplyForm) setIsEditingReplyForm(false)
    }
  }

  componentWillUnmount() {
    const { setIsEditingReplyForm } = this.props
    window.removeEventListener('beforeunload', onUnload)
    if (setIsEditingReplyForm) setIsEditingReplyForm(false)
  }

  submitReply(
    reply: ReplyForm_reply$data | null | undefined,
    questionnaire: ReplyForm_questionnaire$data,
    form: string,
    dispatch: Dispatch,
  ) {
    analytics.track('submit_reply_click', {
      stepName: questionnaire.step?.title || '',
    })
    dispatch(stopSubmit(form))
    Promise.resolve(dispatch(changeRedux(form, 'draft', false))).then(() => {
      dispatch(submit(form))
    })
  }

  formIsDisabled() {
    const { questionnaire } = this.props
    return !questionnaire.contribuable
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
      isAuthenticated,
      backgroundPrimaryButton,
      replyId,
    } = this.props
    const availableQuestions = memoizeAvailableQuestions.cache.get(getAvailabeQuestionsCacheKey(questionnaire.id))
    const disabled = this.formIsDisabled()
    const isDraft = reply && reply.draft
    const { step } = questionnaire
    const url = new URL(window.location.href)
    const participantMeetsTheRequirement = step?.requirements?.participantMeetsTheRequirements || false
    const stepHasRequirement = step?.requirements && step.requirements.totalCount > 0

    const showCaptcha =
      (!stepHasRequirement || participantMeetsTheRequirement) && !replyId && !isAuthenticated && !reply

    const showRequirementsModal =
      (replyId && !showCaptcha && submitSucceeded) || (url.searchParams.has('workflow') && replyId)

    const disabledSubmitBtn = () => {
      const isNativeFormValid = this.formRef.current?.reportValidity() ?? true
      const isDisabled =
        invalidRequirements || invalid || submitting || disabled || !isNativeFormValid || showRequirementsModal

      if (!isAuthenticated) {
        return isDisabled || (!this.state.captcha.value && showCaptcha)
      }

      return isDisabled
    }

    if (showRequirementsModal) {
      return createPortal(
        <Box width="100%" height="100vh" position="absolute" top={0} left={0}>
          <Suspense fallback={<ModalSkeleton />}>
            <ParticipationWorkflowModal stepId={step.id} contributionId={replyId} />
          </Suspense>
        </Box>,
        document.body,
      )
    }

    return (
      <>
        <QuestionnaireContainer id="reply-form" onSubmit={handleSubmit} ref={this.formRef}>
          {questionnaire.description && (
            <WYSIWYGRender className="questionnaire__description" value={questionnaire.description} />
          )}

          <ReplyFormContainer id="reply-form-container">
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
                    disabled={disabled}
                  >
                    <FormattedMessage id="reply.form.private" />
                  </Field>
                </WrapperWithMargeX>
              </>
            )}

            {showCaptcha && (
              <WrapperWithMargeX display="flex" flexDirection="column" alignItems="flex-start" pb="32px">
                <Text
                  css={css({
                    mb: `${SPACES_SCALES[6]} !important`,
                  })}
                  textAlign="center"
                  className="captcha-message"
                  color="neutral-gray.700"
                >
                  {intl.formatMessage({
                    id: 'captcha.check',
                  })}
                </Text>
                <Captcha
                  style={{
                    transformOrigin: 'center',
                  }}
                  onChange={value => {
                    this.setState(state => ({
                      captcha: { ...state.captcha, value },
                    }))
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
                  disabled={pristine || submitting || disabled || invalidRequirements || showRequirementsModal}
                  bsStyle="primary"
                  label={submitting || showRequirementsModal ? 'global.loading' : 'global.save_as_draft'}
                  onSubmit={() => {
                    analytics.track('submit_draft_reply_click', {
                      stepName: step?.title || '',
                    })
                    dispatch(changeRedux(form, 'draft', true))
                  }}
                />
              )}
              <SubmitButton
                type="submit"
                id={`${form}-submit-create-reply`}
                bsStyle="info"
                style={{
                  backgroundColor: backgroundPrimaryButton,
                  borderColor: backgroundPrimaryButton,
                }}
                disabled={disabledSubmitBtn()}
                label={submitting || showRequirementsModal ? 'global.loading' : 'global.send'}
                onSubmit={() => {
                  this.submitReply(reply, questionnaire, form, dispatch)
                }}
              />
            </ButtonGroupSubmit>
          )}

          {!disabled && !pristine && !showRequirementsModal && (
            <AlertForm
              valid={valid}
              invalid={invalid}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              submitting={submitting}
            />
          )}
        </QuestionnaireContainer>
      </>
    )
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const { reply, questionnaire } = props
  const defaultResponses = formatInitialResponsesValues(questionnaire.questions, reply ? reply.responses : [])
  const form = reply ? getFormNameUpdate(reply.id) : `Create${formName}`
  return {
    responses: formValueSelector(form)(state, 'responses') || defaultResponses,
    initialValues: {
      id: reply?.id ?? null,
      responses: defaultResponses,
      draft: reply ? reply.draft : true,
      private: reply ? reply.private : false,
    },
    replyId: getFormValues(form)(state)?.id,
    user: state.user.user,
    isAuthenticated: !!state.user.user,
    form,
    invalidRequirements:
      isInvalid(RequirementsFormLegacyName)(state) ||
      Object.keys(getFormSyncErrors(RequirementsFormLegacyName)(state)).length > 0,
    platformName: state.default.parameters['global.site.fullname'],
    backgroundPrimaryButton: state.default.parameters['color.btn.primary.bg'],
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  destroyOnUnmount: false,
})(ReplyForm)
// @ts-ignore
const container = connect<any, any>(mapStateToProps)(injectIntl(form))
const containerWithRouter = withRouter(container)
export default createFragmentContainer(containerWithRouter, {
  reply: graphql`
    fragment ReplyForm_reply on Reply @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      id
      draft
      private
      viewerCanUpdate @include(if: $isAuthenticated)
      responses {
        ...responsesHelper_response @relay(mask: false)
      }
    }
  `,
  questionnaire: graphql`
    fragment ReplyForm_questionnaire on Questionnaire
    @argumentDefinitions(
      isAuthenticated: { type: "Boolean!", defaultValue: true }
      participantToken: { type: "String" }
    ) {
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
            participantMeetsTheRequirements(token: $participantToken)
          }
        }
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
})
