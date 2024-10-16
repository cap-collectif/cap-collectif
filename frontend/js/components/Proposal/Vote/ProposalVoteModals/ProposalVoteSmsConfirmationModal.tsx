import { $PropertyType } from 'utility-types'
import * as React from 'react'
import {
  Button,
  CapUIFontFamily,
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  Heading,
  MultiStepModal,
  SpotIcon,
  Text,
  Tooltip,
  useMultiStepModal,
  CapUIIcon, toast,
} from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormattedHTMLMessage, useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import { graphql, useFragment } from 'react-relay'
import formatPhoneNumber from '~/utils/formatPhoneNumber'
import phoneSplitter from '~/utils/phoneSplitter'
import VerifySmsVotePhoneNumberMutation from '~/mutations/VerifySmsVotePhoneNumberMutation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import SendSmsProposalVoteMutation from '~/mutations/SendSmsProposalVoteMutation'
import type { VerifySmsVotePhoneNumberMutation$data } from '~relay/VerifySmsVotePhoneNumberMutation.graphql'
import type { SendSmsProposalVoteMutation$data } from '~relay/SendSmsProposalVoteMutation.graphql'
import CookieMonster from '@shared/utils/CookieMonster'
import ResetCss from '~/utils/ResetCss'
import type { ProposalVoteSmsConfirmationModal_step$key } from '~relay/ProposalVoteSmsConfirmationModal_step.graphql'
import type { ProposalVoteSmsConfirmationModal_proposal$key } from '~relay/ProposalVoteSmsConfirmationModal_proposal.graphql'
import AddProposalSmsVoteMutation from '~/mutations/AddProposalSmsVoteMutation'
import {AddProposalSmsVoteMutation$data} from '~relay/AddProposalSmsVoteMutation.graphql'

export const formName = 'vote-sms-validation-form'
export type FormValues = {
  code: string
}
export type ProposalVoteSmsConfirmationModalProps = {
  readonly countryCode: string
  readonly phone: string
  readonly proposal: ProposalVoteSmsConfirmationModal_proposal$key
  readonly step: ProposalVoteSmsConfirmationModal_step$key
  readonly consentSmsCommunication: boolean
  readonly setIsLoading: (isLoading: boolean) => void
  readonly isLoading: boolean
}
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteSmsConfirmationModal_proposal on Proposal {
    id
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalVoteSmsConfirmationModal_step on ProposalStep {
    id
    votesMin
    votesLimit
  }
`

const getPhone = (countryCode: string, phoneNumber: string) => {
  return `${countryCode}${phoneNumber.split('')[0] === '0' ? phoneNumber.slice(1) : phoneNumber}`
}

const ProposalVoteSmsConfirmationModal = ({
  countryCode,
  phone,
  proposal: proposalRef,
  step: stepRef,
  consentSmsCommunication,
  setIsLoading,
  isLoading,
}: ProposalVoteSmsConfirmationModalProps) => {
  const intl = useIntl()
  const [verified, setVerified] = React.useState<boolean>(false)
  const [limitReached, setLimitReached] = React.useState<boolean>(false)
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const parsedPhone = getPhone(countryCode, phone)
  const { goToNextStep, goToPreviousStep, hide } = useMultiStepModal()
  const form = useForm<any>({
    mode: 'onChange',
    defaultValues: {
      code: '',
    },
  })
  const { control, formState, setValue, setError } = form
  const hasErrors = Object.keys(formState.errors).length > 0

  const validateCode = async (code: $PropertyType<FormValues, 'code'>) => {
    if (!verified) {
      try {
        setIsLoading(true)
        const verifyCodeResponse: VerifySmsVotePhoneNumberMutation$data =
          await VerifySmsVotePhoneNumberMutation.commit({
            input: {
              code,
              phone: parsedPhone,
              proposalId: proposal?.id,
              stepId: step?.id,
            },
          })
        const verifyCodeErrorCode = verifyCodeResponse.verifySmsVotePhoneNumber?.errorCode

        if (verifyCodeErrorCode !== null) {
          resetCode()
          setError('code', {})
        }

        if (verifyCodeErrorCode === 'CODE_EXPIRED') {
          setError('code', {
            type: 'custom',
            message: intl.formatMessage({
              id: 'CODE_EXPIRED',
            }),
          })
          return
        }

        if (verifyCodeErrorCode === 'CODE_NOT_VALID') {
          setError('code', {
            type: 'custom',
            message: intl.formatMessage({
              id: 'CODE_NOT_VALID',
            }),
          })
          return
        }

        if (verifyCodeErrorCode === 'TWILIO_API_ERROR') {
          mutationErrorToast(intl)
          return
        }

        const token = verifyCodeResponse.verifySmsVotePhoneNumber?.token ?? ''

        if (token && (step.votesMin || step.votesLimit)) {
          localStorage.setItem('AnonVoteToken', token)
          localStorage.setItem('consentSmsCommunication', consentSmsCommunication ? '1' : '0')
          goToNextStep()
          return;
        }

        const addProposalSmsVoteResponse: AddProposalSmsVoteMutation$data = await AddProposalSmsVoteMutation.commit({
          input: {
            token,
            proposalId: proposal?.id,
            stepId: step?.id,
            consentSmsCommunication,
          },
          token,
        })
        const addSmsVoteErrorCode = addProposalSmsVoteResponse.addProposalSmsVote?.errorCode ?? null

        if (addSmsVoteErrorCode !== null) {
          setIsLoading(false)
        }

        if (addSmsVoteErrorCode === 'PHONE_NOT_FOUND') {
          return mutationErrorToast(intl)
        }

        if (['PROPOSAL_ALREADY_VOTED', 'VOTELIMIT_REACHED'].includes(addSmsVoteErrorCode)) {
          const errorMap = {
            'PROPOSAL_ALREADY_VOTED': {
              id: 'rejected-vote-choose-another-one'
            },
            'VOTELIMIT_REACHED': {
              id: 'you-reached-max-votes'
            },
          }
          const {id} = errorMap[addSmsVoteErrorCode]

          toast({
            variant: 'danger',
            content: intl.formatMessage({ id }),
          })

          hide();
          CookieMonster.addAnonymousAuthenticatedWithConfirmedPhone(token)
          return;
        }

        CookieMonster.addAnonymousAuthenticatedWithConfirmedPhone(token)
        setVerified(true)
        setIsLoading(false)
        hide()
        toast({
          variant: 'success',
          content: intl.formatMessage({ id: 'your-vote-has-been-validated' })
        })

      } catch (e) {
        mutationErrorToast(intl)
      }
    }

    return true
  }

  const resetCode = (): void => {
    setIsLoading(false)
    setValue('code', '')
  }

  const sendNewPhoneValidationCode = async () => {
    resetCode()

    try {
      const input = {
        phone: parsedPhone,
        proposalId: proposal?.id,
        stepId: step?.id,
      }
      const response: SendSmsProposalVoteMutation$data = await SendSmsProposalVoteMutation.commit({
        input,
      })
      const errorCode = response.sendSmsProposalVote?.errorCode

      if (errorCode === 'RETRY_LIMIT_REACHED') {
        setLimitReached(true)
      }
    } catch (e) {
      mutationErrorToast(intl)
    }
  }

  // ! This is required to prevent weird display and autofocus not working
  // TODO: Update Modal
  const focusInputRef = React.useCallback(node => {
    setTimeout(() => {
      if (node !== null) {
        node.querySelector('input').focus()
      }
    }, 210)
  }, [])

  const onComplete = e => {
    validateCode(e.target.value)
  }

  const token = CookieMonster.getAnonymousAuthenticatedWithConfirmedPhone() || localStorage.getItem('AnonVoteToken')

  if (token) {
    goToNextStep()
    return null;
  }

  return (
    <>
      <ResetCss>
        <MultiStepModal.Header closeIconLabel={intl.formatMessage({ id: 'global.close' })}>
          <MultiStepModal.Header.Label>
            {intl.formatMessage({
              id: 'proposal.validate.vote',
            })}
          </MultiStepModal.Header.Label>
          <Heading>
            {intl.formatMessage({
              id: 'number-verification',
            })}
          </Heading>
        </MultiStepModal.Header>
      </ResetCss>
      <MultiStepModal.Body>
        <p className="sr-only">{intl.formatMessage({ id: 'verification-nth-step-over' }, { current: 2, total: 3 })}</p>
        <Flex as="form" direction="column" spacing={3} align="center" justify="center">
          <SpotIcon name={CapUISpotIcon.ADD_CONTACT} size={CapUISpotIconSize.Lg} />
          <Text textAlign="center" fontSize="18px" lineHeight="24px">
            <FormattedHTMLMessage
              id="confirmation.code.header.title"
              values={{
                phoneNumber: phoneSplitter(formatPhoneNumber(phone)),
              }}
            />
          </Text>
          <FormControl name="code" control={control} isRequired isDisabled={formState.isSubmitting} align="center">
            {/* Extra div is required to pass the ref and fix display */}
            <div ref={focusInputRef}>
              <FieldInput
                control={control}
                onChange={onComplete}
                type="codeInput"
                name="code"
                isVerified={verified}
                isRequired
                title={intl.formatMessage({ id: 'phone.confirm.code' })}
              />
            </div>
            {verified && (
              <Text
                color="green.500"
                fontFamily={CapUIFontFamily.Body}
                lineHeight="normal"
                fontSize={3}
                textAlign="center"
              >
                {intl.formatMessage({
                  id: 'code.validation.success',
                })}
              </Text>
            )}
          </FormControl>
          {limitReached ? (
            <Tooltip
              zIndex={1500}
              id="tooltip"
              label={intl.formatMessage({
                id: 'code.limit.reached',
              })}
            >
              <Button variant="link" variantColor="hierarchy">
                {intl.formatMessage({
                  id: 'get.new.code',
                })}
              </Button>
            </Tooltip>
          ) : (
            <Button variant="link" onClick={sendNewPhoneValidationCode}>
              {intl.formatMessage({
                id: 'get.new.code',
              })}
            </Button>
          )}
        </Flex>
      </MultiStepModal.Body>
      <MultiStepModal.Footer>
        <Button onClick={goToPreviousStep} variant="secondary" variantColor="hierarchy" variantSize="medium">
          {intl.formatMessage({
            id: 'global.back',
          })}
        </Button>
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="medium"
          rightIcon={CapUIIcon.LongArrowRight}
          onClick={goToNextStep}
          isLoading={isLoading}
          disabled={form.watch('code').length !== 6 || hasErrors}
        >
          {intl.formatMessage({
            id: 'proposal.validate.vote',
          })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default ProposalVoteSmsConfirmationModal
