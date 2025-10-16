import React, { useEffect } from 'react'
import { Box, CapUIFontSize, Flex, Text, toast, useMultiStepModal } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import ModalLayout from '~/components/ParticipationWorkflow/ModalLayout'
import { useValidateContributionMutation } from '~/mutations/ValidateContributionMutation'
import CookieMonster from '@shared/utils/CookieMonster'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import { fakeTimer } from '~/utils/timer'
import ReplyValidationSVG from '~/components/ParticipationWorkflow/assets/ReplyValidationSVG'
import VoteValidationSVG from '~/components/ParticipationWorkflow/assets/VoteValidationSVG'
import { useParticipationWorkflow } from '~/components/ParticipationWorkflow/ParticipationWorkflowContext'
import { CenteredLogoLayout } from '~/components/ParticipationWorkflow/ModalLayoutHeader'

type Props = {
  contributionId: string
}

const ContributionValidationModal: React.FC<Props> = ({ contributionId }) => {
  const intl = useIntl()
  const token = CookieMonster.getParticipantCookie()
  const { commit } = useValidateContributionMutation()
  const { contributionTypeName } = useParticipationWorkflow()
  const { totalSteps, currentStep, goToNextStep } = useMultiStepModal()

  const hasNextStep = totalSteps > currentStep + 1

  const config = {
    Reply: {
      title: intl.formatMessage({ id: 'participation-workflow.send_answers' }),
      info: intl.formatMessage({ id: 'participation-workflow.no_fault' }),
      svg: <ReplyValidationSVG />,
      successTranslationKey: 'your-participation-is-confirmed',
    },
    ProposalVote: {
      title: intl.formatMessage({ id: 'vote-validation-workflow' }),
      info: intl.formatMessage({ id: 'it-is-a-good-choice' }),
      svg: <VoteValidationSVG />,
      successTranslationKey: 'your-participation-is-confirmed',
    },
  }

  const { title, info, svg: SVG, successTranslationKey } = config[contributionTypeName]

  useEffect(() => {
    const input = {
      contributionId,
      token,
    }

    commit({
      variables: {
        input,
      },
      onCompleted: async (response, errors) => {
        if (errors && errors.length > 0) {
          for (const error of errors) {
            if (error.message === 'Step closed') {
              toast({
                variant: 'danger',
                content: intl.formatMessage({ id: 'error-contribution-validation' }),
              })
              setTimeout(() => {
                window.location.href = '/'
              }, 1000)
              return
            }
          }
          return mutationErrorToast(intl)
        }

        await fakeTimer(800)

        if (hasNextStep) {
          goToNextStep()
          return
        }

        const toastConfig = JSON.stringify({ variant: 'success', message: `${successTranslationKey}` })
        window.location.href = `${response?.validateContribution?.redirectUrl}?toast=${toastConfig}`
      },
      onError: () => {
        return mutationErrorToast(intl)
      },
    })
  }, [commit, intl, contributionId, token, successTranslationKey, hasNextStep, goToNextStep])

  return (
    <ModalLayout
      title={''}
      info={''}
      hideGoBackArrow
      onClose={() => {}}
      header={({ logo }) => <CenteredLogoLayout logo={logo} />}
    >
      <Flex width="100%" justifyContent="center" order={[-1, 0]}>
        {SVG}
      </Flex>
      <Box
        mb={4}
        width="100%"
        fontSize={[CapUIFontSize.Headline, CapUIFontSize.DisplaySmall]}
        textAlign="center"
        fontWeight={[600, 400]}
        color="neutral-gray.900"
      >
        {title}
      </Box>
      <Text
        sx={{ marginBottom: '16px !important' }}
        textAlign={['left', 'center']}
        color="neutral-gray.700"
        fontSize={CapUIFontSize.BodyRegular}
        lineHeight="normal"
      >
        {info}
      </Text>
    </ModalLayout>
  )
}

export default ContributionValidationModal
