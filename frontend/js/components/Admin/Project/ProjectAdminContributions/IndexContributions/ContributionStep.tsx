import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { createFragmentContainer, graphql } from 'react-relay'
import type { ContributionStep_step } from '~relay/ContributionStep_step.graphql'
import '~relay/ContributionStep_step.graphql'
import type { StepType } from '~/constants/StepTypeConstants'
import { STEP_TYPES } from '~/constants/StepTypeConstants'
import SpotIcon, { SPOT_ICON_NAME, SPOT_ICON_SIZE } from '~ds/SpotIcon/SpotIcon'
import { Flex, Heading, Text } from '@cap-collectif/ui'

const getIllustrationStep = (
  type: string,
):
  | typeof SPOT_ICON_NAME.BULB_SKETCH
  | typeof SPOT_ICON_NAME.RATING_CLICK
  | typeof SPOT_ICON_NAME.USER_DISCUSS
  | typeof SPOT_ICON_NAME.QUESTIONNAIRE => {
  switch (type) {
    case 'CollectStep':
      return SPOT_ICON_NAME.BULB_SKETCH

    case 'SelectionStep':
      return SPOT_ICON_NAME.RATING_CLICK

    case 'DebateStep':
      return SPOT_ICON_NAME.USER_DISCUSS

    case 'QuestionnaireStep':
      return SPOT_ICON_NAME.QUESTIONNAIRE

    default:
      return ''
  }
}

type Props = {
  step: ContributionStep_step
}

const ContributionStep = ({ step }: Props) => {
  const wordingStep = (STEP_TYPES.find(s => s.value === step.__typename) as any as StepType).label
  return (
    <Flex direction="row" bg="white" p={2} borderRadius="normal" px={2} py={4} align="center" spacing={3} width="50%">
      <SpotIcon name={getIllustrationStep(step.__typename)} size={SPOT_ICON_SIZE.SM} />

      <Flex direction="column">
        <Heading as="h4" color="blue.900" m={0}>
          {step.title}
        </Heading>
        <Text color="gray.500">
          <FormattedMessage id={wordingStep} />
        </Text>
      </Flex>
    </Flex>
  )
}

export default createFragmentContainer(ContributionStep, {
  step: graphql`
    fragment ContributionStep_step on Step {
      __typename
      title
    }
  `,
})
