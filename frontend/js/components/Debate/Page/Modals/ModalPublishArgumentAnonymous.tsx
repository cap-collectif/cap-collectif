import { $Values } from 'utility-types'
import * as React from 'react'
import type { IntlShape } from 'react-intl'
import { useIntl, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector, change, SubmissionError } from 'redux-form'
import { fetchQuery_DEPRECATED, graphql } from 'react-relay'
import {
  Flex,
  Button,
  Modal,
  Heading,
  Text,
  Box,
  Icon,
  CapUIIconSize,
  SpotIcon,
  CapUISpotIcon,
  CapUIModalSize,
  CapUIIcon,
  CapUISpotIconSize,
} from '@cap-collectif/ui'
import component from '~/components/Form/Field'
import { isEmail } from '~/services/Validator'
import type { Dispatch, State } from '~/types'
import CookieMonster from '@shared/utils/CookieMonster'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import environment from '~/createRelayEnvironment'
import { ChartLinkComponent, PrivacyPolicyComponent } from '@shared/register/RegistrationForm'
import AddDebateAnonymousArgumentMutation from '~/mutations/AddDebateAnonymousArgumentMutation'
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context'
import SendConfirmationEmailDebateAnonymousArgumentMutation from '~/mutations/SendConfirmationEmailDebateAnonymousArgumentMutation'
import ResetCss from '~/utils/ResetCss'
import { openLoginModal } from '@shared/login/LoginButton'
const STATE = {
  FORM: 'FORM',
  INFO: 'INFO',
  MAIL_SENT: 'MAIL_SENT',
  VERIFY_MAIL: 'VERIFY_MAIL',
}
type FormValues = {
  readonly username: string | null | undefined
  readonly email: string
  readonly charte: boolean
  readonly consentInternalCommunication: boolean
}
type BeforeConnectProps = {
  readonly formName: string
  readonly initialState: $Values<typeof STATE>
  readonly message: string
  readonly isMobile?: boolean
  readonly title: string
  readonly viewerVoteValue: 'FOR' | 'AGAINST'
  readonly debate: string
  readonly argumentBody?: string
  readonly internalCommunicationFrom?: string
}
type StateProps = {
  readonly body: string | null | undefined
  readonly dispatch: Dispatch
  readonly cguName: string
  readonly privacyPolicyRequired: boolean
  readonly initialValues: FormValues
}
type AfterConnectProps = BeforeConnectProps &
  StateProps & {
    readonly email: string | null | undefined
  }
type Props = AfterConnectProps &
  ReduxFormFormProps & {
    readonly setModalState: (arg0: $Values<typeof STATE>) => void
    readonly modalState: $Values<typeof STATE>
    readonly location: string | null | undefined
    readonly intl: IntlShape
    readonly comment: string | null | undefined
    readonly user: Record<string, any> | null | undefined
    readonly form: string
  }
const anonymousFormMail = 'debate-argument-form-anonymous'
const isEmailAlreadyUsed = graphql`
  query ModalPublishArgumentAnonymous_isEmailAlreadyTakenQuery($email: Email!) {
    isEmailAlreadyTaken(email: $email)
  }
`

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { username, email, consentInternalCommunication } = values
  const { viewerVoteValue, debate, body, setModalState, location, intl } = props
  return fetchQuery_DEPRECATED(environment, isEmailAlreadyUsed, {
    email,
  }).then((res: { isEmailAlreadyTaken: boolean }) => {
    if (res.isEmailAlreadyTaken && !location) {
      dispatchEvent(new Event(openLoginModal))
      dispatch(change('login', 'username', email))
      dispatch(
        change(
          'login',
          'onSuccessAction',
          `{"action":"DEBATE_ARGUMENT","debate":"${debate}","body":"${
            body || ''
          }","type":"${viewerVoteValue}","widgetOriginURI":"${location || ''}"}`,
        ),
      )
    } else
      return AddDebateAnonymousArgumentMutation.commit({
        input: {
          username,
          email,
          body: body || '',
          debate,
          type: viewerVoteValue,
          widgetOriginURI: location,
          consentInternalCommunication,
        },
      })
        .then(response => {
          if (response.createDebateAnonymousArgument?.errorCode) {
            if (response.createDebateAnonymousArgument.errorCode === 'ALREADY_HAS_ARGUMENT')
              throw new SubmissionError({
                email: 'registration.constraints.email.already_used',
              })
            else mutationErrorToast(intl)
          } else {
            setModalState('MAIL_SENT')

            if (
              response.createDebateAnonymousArgument?.token &&
              response.createDebateAnonymousArgument.debateArgument
            ) {
              CookieMonster.addDebateAnonymousArgumentCookie(debate, {
                type: viewerVoteValue,
                token: response.createDebateAnonymousArgument.token,
                id: response.createDebateAnonymousArgument.debateArgument.id,
              })
            }
          }
        })
        .catch(e => {
          if (e instanceof SubmissionError) {
            throw e
          }

          throw new SubmissionError({
            _error: 'global.error.server.form',
          })
        })
  })
}

const ModalContent = ({
  modalState,
  cguName,
  privacyPolicyRequired,
  invalid,
  pristine,
  title,
  body,
  isMobile,
  setModalState,
  handleSubmit,
  intl,
  email,
  debate,
  internalCommunicationFrom,
  submitting,
}: Props) => {
  const focusInputRef = React.useCallback(node => {
    if (node !== null) {
      const $input = node.querySelector('[name="body"]')

      if ($input) {
        $input.focus()
      }
    }
  }, [])

  const resendEmail = () => {
    const anonymousArgumentHash = CookieMonster.getHashedDebateAnonymousArgumentCookie(debate)
    return SendConfirmationEmailDebateAnonymousArgumentMutation.commit({
      input: {
        debate,
        hash: anonymousArgumentHash || '',
      },
    })
      .then(response => {
        if (response.sendConfirmationEmailDebateAnonymousArgument?.errorCode) {
          mutationErrorToast(intl)
        } else {
          setModalState('VERIFY_MAIL')
        }
      })
      .catch(() => {
        mutationErrorToast(intl)
      })
  }

  return (
    <>
      <form ref={focusInputRef} id={anonymousFormMail} onSubmit={handleSubmit}>
        {modalState === 'FORM' && (
          <>
            <ResetCss>
              <Modal.Header>
                <Text fontSize={18} fontWeight={600} color="blue.900">
                  {intl.formatMessage({
                    id: title,
                  })}
                </Text>
              </Modal.Header>
            </ResetCss>
            <Modal.Body>
              <Field
                name="body"
                component={component}
                autoFocus
                type="textarea"
                id="body"
                rows={5}
                minLength="1"
                autoComplete="off"
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                disabled={!body || !body?.length}
                onClick={() => setModalState('INFO')}
                variant="primary"
                variantSize="big"
                width="100%"
                justifyContent="center"
              >
                {intl.formatMessage({
                  id: 'global.continue',
                })}
              </Button>
            </Modal.Footer>
          </>
        )}
        {modalState === 'INFO' && (
          <>
            <ResetCss>
              <Modal.Header>
                {isMobile && (
                  <Flex>
                    <Icon
                      onClick={() => setModalState('FORM')}
                      sx={{
                        '&:hover': {
                          cursor: 'pointer',
                        },
                      }}
                      color="blue.900"
                      size={CapUIIconSize.Md}
                      name={CapUIIcon.LongArrowLeft}
                      mr={6}
                    />
                    <Heading as="h4">
                      {intl.formatMessage({
                        id: 'youre-almost-there',
                      })}
                    </Heading>
                  </Flex>
                )}
              </Modal.Header>
            </ResetCss>
            <Modal.Body pb={6} pt={0} align="center" height="auto">
              <Flex direction="column" alignItems="center" width="100%">
                {!isMobile && (
                  <>
                    <SpotIcon name={CapUISpotIcon.BUBBLE} size={CapUISpotIconSize.Lg} mb={4} alignSelf="center" />
                    <Heading as="h4" color="gray.900" m={0} mb={1} fontWeight="600">
                      {intl.formatMessage({
                        id: 'youre-almost-there',
                      })}
                    </Heading>
                    <Text textAlign="center" color="gray.700" fontSize={18}>
                      {intl.formatMessage({
                        id: 'we-need-your-email-argument',
                      })}
                    </Text>
                  </>
                )}
                <Box width="100%" mt={4}>
                  <Field
                    name="username"
                    component={component}
                    autoFocus
                    type="text"
                    id="username"
                    minLength="1"
                    autoComplete="off"
                    label={
                      <>
                        {intl.formatMessage({
                          id: 'global.fullname',
                        })}
                        <span className="excerpt">
                          {intl.formatMessage({
                            id: 'global.optional',
                          })}
                        </span>
                      </>
                    }
                  />
                  <Field
                    name="email"
                    component={component}
                    type="email"
                    id="email"
                    label={intl.formatMessage({
                      id: 'global.email',
                    })}
                  />
                  <Field
                    id="charte"
                    name="charte"
                    component={component}
                    ariaRequired
                    required
                    type="checkbox"
                    labelClassName="font-weight-normal"
                  >
                    <span>
                      <ChartLinkComponent cguName={cguName} />
                      <PrivacyPolicyComponent privacyPolicyRequired={privacyPolicyRequired} />
                    </span>
                  </Field>
                  <Field
                    id="consent-internal-communication"
                    name="consentInternalCommunication"
                    component={component}
                    type="checkbox"
                    labelClassName="font-weight-normal"
                  >
                    <FormattedMessage
                      id="receive-news-and-results-of-the-consultations"
                      values={{
                        from: internalCommunicationFrom,
                      }}
                    />
                  </Field>
                </Box>
              </Flex>
            </Modal.Body>
            <Modal.Footer>
              <Button
                disabled={invalid || pristine}
                type="submit"
                isLoading={submitting}
                onClick={() => {}}
                variant="primary"
                variantSize="big"
                justifyContent="center"
              >
                {intl.formatMessage({
                  id: 'global.send',
                })}
              </Button>
            </Modal.Footer>
          </>
        )}
        {modalState === 'MAIL_SENT' && (
          <>
            <ResetCss>
              <Modal.Header>
                <p />
              </Modal.Header>
            </ResetCss>
            <Modal.Body pb={6} pt={0} align="center" height="auto">
              <Flex direction="column" alignItems="center">
                <SpotIcon name={CapUISpotIcon.PAPER_PLANE_1} size={CapUISpotIconSize.Lg} mb={4} alignSelf="center" />
                <Heading as="h4" color="gray.900" m={0} mb={1} fontWeight="600">
                  {intl.formatMessage({
                    id: 'check-your-mailbox',
                  })}
                </Heading>
                <Text textAlign="center" color="gray.700" fontSize={18}>
                  {intl.formatMessage(
                    {
                      id: 'click-on-mail-to-publish-arg',
                    },
                    {
                      email,
                    },
                  )}
                </Text>
              </Flex>
            </Modal.Body>
            <Modal.Footer>
              <Button width="100%" variant="link" justifyContent="center" onClick={resendEmail}>
                {intl.formatMessage({
                  id: 'you-didnt-received-mail',
                })}
              </Button>
            </Modal.Footer>
          </>
        )}
        {modalState === 'VERIFY_MAIL' && (
          <>
            <ResetCss>
              <Modal.Header />
            </ResetCss>
            <Modal.Body pb={6} pt={0} align="center" height="auto">
              <Flex direction="column" alignItems="center">
                <SpotIcon name={CapUISpotIcon.PAPER_PLANE_2} size={CapUISpotIconSize.Lg} mb={4} alignSelf="center" />
                <Heading as="h4" color="gray.900" m={0} mb={1} fontWeight="600">
                  {intl.formatMessage({
                    id: 'check-your-mailbox',
                  })}
                </Heading>
                <Text textAlign="center" color="gray.700" fontSize={18}>
                  {intl.formatMessage(
                    {
                      id: 'resend-email-arg-anonymous',
                    },
                    {
                      email,
                    },
                  )}
                </Text>
              </Flex>
            </Modal.Body>
          </>
        )}
      </form>
    </>
  )
}

export const ModalPublishArgumentAnonymous = ({
  initialState,
  message,
  isMobile,
  ...rest
}: BeforeConnectProps): JSX.Element => {
  const intl = useIntl()
  const [modalState, setModalState] = React.useState<$Values<typeof STATE>>(initialState)
  const { widget } = useDebateStepPage()
  return (
    <>
      <Modal
        hideOnClickOutside={false}
        ariaLabel={intl.formatMessage({
          id: 'global.menu',
        })}
        size={CapUIModalSize.Xl}
        disclosure={
          <Button
            type="submit"
            variant="primary"
            variantColor="primary"
            variantSize="big"
            justifyContent={isMobile ? 'center' : ''}
            width={isMobile ? '100%' : ''}
            m={widget.location ? 'auto' : ''}
            mt={isMobile ? 1 : 0}
          >
            {intl.formatMessage({
              id: message,
            })}
          </Button>
        }
      >
        {() => (
          <ModalContentConnected
            {...rest}
            modalState={modalState}
            setModalState={setModalState}
            location={widget.location}
            intl={intl}
            isMobile={isMobile}
          />
        )}
      </Modal>
    </>
  )
}
export const validate = (
  values: FormValues,
): {
  errors: {
    email?: string
    charte?: string
  }
} => {
  const errors: any = {}

  if (!values.email || !isEmail(values.email)) {
    errors.email = 'global.constraints.email.invalid'
  }

  if (!values.charte) {
    errors.charte = 'registration.constraints.charte.check'
  }

  return errors
}

const mapStateToProps = (state: State, props: BeforeConnectProps) => {
  return {
    body: props.argumentBody || formValueSelector(anonymousFormMail)(state, 'body'),
    email: formValueSelector(anonymousFormMail)(state, 'email'),
    privacyPolicyRequired: state.default.features.privacy_policy || false,
    cguName: state.default.parameters['signin.cgu.name'],
    internalCommunicationFrom: state.default.parameters['global.site.communication_from'],
    initialValues: {
      username: null,
      email: '',
      charte: false,
      consentInternalCommunication: false,
    },
  }
}

const formContainer = reduxForm({
  form: anonymousFormMail,
  validate,
  onSubmit,
})(ModalContent)
// @ts-ignore
const ModalContentConnected = connect<AfterConnectProps, BeforeConnectProps, _, _, _, _>(mapStateToProps)(formContainer)
export default ModalPublishArgumentAnonymous
