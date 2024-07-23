import React from 'react'
import {
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  FormLabel,
  InputGroup,
  SpotIcon,
  Text,
  MultiStepModal,
  Heading,
  Button,
  useMultiStepModal,
  CapUIIcon,
} from '@cap-collectif/ui'
import type { IntlShape } from 'react-intl'
import { useIntl, FormattedHTMLMessage } from 'react-intl'
import { COUNTRY_CODES, FieldInput, FormControl } from '@cap-collectif/form'
import { useSelector } from 'react-redux'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import SendSmsProposalVoteMutation from '~/mutations/SendSmsProposalVoteMutation'
import type { GlobalState } from '~/types'
import ResetCss from '~/utils/ResetCss'
export const formName = 'vote-requirements-form'
export type Props = {
  readonly form: any
  readonly setIsLoading: (loading: boolean) => void
}

const getPhone = (countryCode: string, phoneNumber: string) => {
  return `${countryCode}${phoneNumber.split('')[0] === '0' ? phoneNumber.slice(1) : phoneNumber}`
}

export const onSmsVoteSubmit = async (
  data: {
    phone: string
    countryCode: string
    stepId: string
    proposalId: string
  },
  goToNextStep: () => void,
  setError: (
    name: string,
    error: {
      type: string
      message: string
    },
  ) => void,
  intl: IntlShape,
  setIsLoading: (isLoading: boolean) => void,
) => {
  setIsLoading(true)
  const input = {
    phone: getPhone(data.countryCode, data.phone),
    stepId: data.stepId,
    proposalId: data.proposalId,
  }

  try {
    const response = await SendSmsProposalVoteMutation.commit({
      input,
    })
    const errorCode = response.sendSmsProposalVote?.errorCode
    if (errorCode !== null) setIsLoading(false)

    if (['INVALID_NUMBER', 'PHONE_INVALID_LENGTH'].includes(errorCode)) {
      setError('phone', {
        type: 'custom',
        message: intl.formatMessage({
          id: 'invalid-format',
        }),
      })
      return
    }

    if (errorCode === 'PHONE_SHOULD_BE_MOBILE_NUMBER') {
      setError('phone', {
        type: 'custom',
        message: intl.formatMessage({
          id: 'phone.validation.mobile.format',
        }),
      })
      return
    }

    if (errorCode === 'PHONE_ALREADY_USED_BY_ANOTHER_USER') {
      setError('phone', {
        type: 'custom',
        message: intl.formatMessage({
          id: 'phone.validation.number.already.used',
        }),
      })
      return
    }

    setIsLoading(false)
    goToNextStep()
  } catch (e) {
    return mutationErrorToast(intl)
  }
}

const ProposalVoteSendSmsModal = ({ form, setIsLoading }: Props) => {
  const intl = useIntl()
  const { control, formState, handleSubmit, setError } = form
  const { isSubmitting } = formState
  const { hide, goToNextStep } = useMultiStepModal()
  const platformName = useSelector((state: GlobalState) => state.default.parameters['global.site.fullname'])
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
              id: 'youre-almost-there',
            })}
          </Heading>
        </MultiStepModal.Header>
      </ResetCss>
      <MultiStepModal.Body>
        <p className="sr-only">{intl.formatMessage({ id: 'verification-nth-step-over' }, { current: 1, total: 3 })}</p>
        <Flex as="form" direction="column" spacing={3} align="center" justify="center">
          <SpotIcon name={CapUISpotIcon.ADD_CONTACT} size={CapUISpotIconSize.Lg} />
          <Text textAlign="center" fontSize="18px" lineHeight="24px">
            <FormattedHTMLMessage id="proposal.requirement.header.title" />
          </Text>
          <InputGroup>
            <FormLabel label="" />
            <FormControl name="countryCode" control={control} isDisabled>
              <FieldInput
                uniqueCountry={COUNTRY_CODES.FR}
                type="flagSelect"
                name="countryCode"
                control={control}
                placeholder={intl.formatMessage({
                  id: 'select.country.placeholder',
                })}
              />
            </FormControl>
            <FormControl name="phone" control={control} isDisabled={isSubmitting}>
              <FieldInput type="tel" name="phone" control={control} />
            </FormControl>
          </InputGroup>
          <Flex align="center">
            <FormControl name="consentSmsCommunication" control={control} isDisabled={isSubmitting}>
              <FieldInput id="consentSmsCommunication" type="checkbox" name="consentSmsCommunication" control={control}>
                {intl.formatMessage(
                  {
                    id: 'i-would-like-to-receive-news-about-platform-projects',
                  },
                  {
                    platformName,
                  },
                )}
              </FieldInput>
            </FormControl>
          </Flex>
        </Flex>
      </MultiStepModal.Body>
      <MultiStepModal.Footer>
        <Button
          disabled={isSubmitting}
          onClick={hide}
          variant="secondary"
          variantColor="hierarchy"
          variantSize="medium"
        >
          {intl.formatMessage({
            id: 'global.back',
          })}
        </Button>
        <Button
          onClick={e => {
            handleSubmit(data => onSmsVoteSubmit(data, goToNextStep, setError, intl, setIsLoading))(e)
          }}
          isLoading={isSubmitting}
          type="submit"
          variant="secondary"
          variantColor="primary"
          variantSize="medium"
          rightIcon={CapUIIcon.LongArrowRight}
        >
          {intl.formatMessage({
            id: 'verify.number',
          })}
        </Button>
      </MultiStepModal.Footer>
    </>
  )
}

export default ProposalVoteSendSmsModal
