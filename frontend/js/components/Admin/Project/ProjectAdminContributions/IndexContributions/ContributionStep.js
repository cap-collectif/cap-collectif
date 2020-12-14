// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import { type ContributionStep_step } from '~relay/ContributionStep_step.graphql';
import { STEP_TYPES, type StepType } from '~/constants/StepTypeConstants';
import { baseUrl } from '~/config';
import Heading from '~ui/Primitives/Heading';

const getIllustrationStep = (type: string): string => {
  switch (type) {
    case 'CollectStep':
      return `${baseUrl}/image/contribution_consultation.png`;
    case 'DebateStep':
      return `${baseUrl}/image/contribution_debate.png`;
    default:
      return '';
  }
};

type Props = {|
  step: ContributionStep_step,
|};

const ContributionStep = ({ step }: Props) => {
  const wordingStep = ((STEP_TYPES.find(s => s.value === step.__typename): any): StepType).label;

  return (
    <Flex
      direction="row"
      bg="white"
      p={2}
      borderRadius="normal"
      px={2}
      py={4}
      align="center"
      spacing={3}
      width="50%">
      <img src={getIllustrationStep(step.__typename)} alt="" />

      <Flex direction="column">
        <Heading as="h4" color="blue.900" m={0}>
          {step.title}
        </Heading>
        <Text color="gray.500">
          <FormattedMessage id={wordingStep} />
        </Text>
      </Flex>
    </Flex>
  );
};

export default createFragmentContainer(ContributionStep, {
  step: graphql`
    fragment ContributionStep_step on Step {
      __typename
      title
    }
  `,
});
