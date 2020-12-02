// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import type { DebateStepPageArguments_step } from '~relay/DebateStepPageArguments_step.graphql';
import Heading from '~ui/Primitives/Heading';

type Props = {|
  +step: ?DebateStepPageArguments_step,
|};

const ProposalPageMainContentContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div``;

export const DebateStepPageArguments = ({ step }: Props) => {
  const opinionsCount = step?.debate?.opinions?.totalCount;
  return (
    <ProposalPageMainContentContainer id="DebateStepPageArguments">
      <Heading as="h3" fontWeight="400" mb={6} capitalize>
        <FormattedMessage id="shortcut.opinion" values={{ num: opinionsCount }} />
      </Heading>
    </ProposalPageMainContentContainer>
  );
};

export default createFragmentContainer(DebateStepPageArguments, {
  step: graphql`
    fragment DebateStepPageArguments_step on DebateStep {
      id
      debate {
        opinions {
          totalCount
        }
      }
    }
  `,
});
