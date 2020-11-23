// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ReactPlaceholder from 'react-placeholder';
import { TextRow } from 'react-placeholder/lib/placeholders';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import ProposalDetailAdvancement, { type Step } from '../../Detail/ProposalDetailAdvancement';
import type { ProposalPageAdvancement_proposal } from '~relay/ProposalPageAdvancement_proposal.graphql';
import { Card } from '~/components/Proposal/Page/ProposalPage.style';

type Props = { proposal: ProposalPageAdvancement_proposal };

export const ProposalDetailAdvancementContainer: StyledComponent<
  {},
  {},
  HTMLDivElement,
> = styled.div`
  padding: 20px;

  h4 {
    margin: 0;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
    color: ${colors.darkText};
  }
`;

const AdvancementStepPlaceholderContainer: StyledComponent<
  { isLast?: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  display: flex;
  margin-left: ${({ isLast }) => (isLast ? '9px' : '5px')};
  height: ${({ isLast }) => !isLast && '60px'};
  border-left: ${({ isLast }) => !isLast && `4px solid ${colors.iconGrayColor}`};

  > div:first-child {
    border-radius: 8px;
    background: ${colors.iconGrayColor};
    width: 16px;
    height: 16px;
    margin-left: -10px;
  }
`;

const AdvancementStepPlaceholder = ({ isLast }: { isLast?: boolean }) => (
  <AdvancementStepPlaceholderContainer isLast={isLast}>
    <div />
    <div style={{ marginLeft: 15 }}>
      <TextRow color={colors.borderColor} style={{ width: 115, height: 15, marginTop: 0 }} />
      <TextRow color={colors.borderColor} style={{ width: 150, height: 12, marginTop: 10 }} />
    </div>
  </AdvancementStepPlaceholderContainer>
);

const advancementPlaceholder = (
  <div>
    <AdvancementStepPlaceholder />
    <AdvancementStepPlaceholder />
    <AdvancementStepPlaceholder isLast />
  </div>
);

const getMutableSteps = (proposal: ProposalPageAdvancement_proposal) => {
  if (!proposal?.project || !proposal?.project?.steps) return [];
  return proposal.project.steps.slice().map<$Shape<Step>>(step => Object.assign({}, step)); // $Shape & Object.assign allow modification of the steps
};

export const ProposalPageAdvancement = ({ proposal }: Props) => {
  const steps = getMutableSteps(proposal);

  for (const step of steps) {
    step.isSelected =
      step.__typename === 'CollectStep' ||
      proposal?.selections.map(selection => selection.step.id).includes(step.id);
  }
  let consideredCurrent = { step: steps[0], position: 0 };
  for (const [position, step] of steps.entries()) {
    if (step.isSelected) {
      consideredCurrent = { step, position };
    }
  }
  for (const [position, step] of steps.entries()) {
    step.isCurrent = step.id === consideredCurrent.step.id;
    step.isPast = position < consideredCurrent.position;
    step.isFuture = position > consideredCurrent.position;
  }
  const displayedSteps = steps.filter(step => (step.isSelected || step.isFuture) && step.enabled);
  if (!displayedSteps || displayedSteps.length < 2) return null;
  return (
    <Card id="ProposalPageAdvancement">
      <ProposalDetailAdvancementContainer>
        <FormattedMessage tagName="h4" id="proposal.detail.advancement" />
        {proposal ? (
          <ProposalDetailAdvancement proposal={proposal} displayedSteps={displayedSteps} />
        ) : (
          <ReactPlaceholder
            showLoadingAnimation
            customPlaceholder={advancementPlaceholder}
            ready={false}
          />
        )}
      </ProposalDetailAdvancementContainer>
    </Card>
  );
};

export default createFragmentContainer(ProposalPageAdvancement, {
  proposal: graphql`
    fragment ProposalPageAdvancement_proposal on Proposal {
      ...ProposalDetailAdvancement_proposal
      status {
        name
        color
      }
      selections {
        step {
          id
        }
        status {
          name
          color
        }
      }
      progressSteps {
        title
        startAt
        endAt
      }
      project {
        id
        steps(orderBy: { field: POSITION, direction: ASC }) {
          enabled
          id
          title
          __typename
          timeless
          timeRange {
            startAt
            endAt
          }
          ... on SelectionStep {
            allowingProgressSteps
          }
        }
      }
    }
  `,
});
