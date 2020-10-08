// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ReactPlaceholder from 'react-placeholder';
import { TextRow } from 'react-placeholder/lib/placeholders';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import colors from '~/utils/colors';
import ProposalDetailAdvancement from '../../Detail/ProposalDetailAdvancement';
import type { ProposalPageAdvancement_proposal } from '~relay/ProposalPageAdvancement_proposal.graphql';
import { Card } from '~/components/Proposal/Page/ProposalPage.style';

type Props = { proposal: ProposalPageAdvancement_proposal };

const ProposalDetailAdvancementContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
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

export const ProposalPageAdvancement = ({ proposal }: Props) => (
  <Card id="ProposalPageAdvancement">
    <ProposalDetailAdvancementContainer>
      <h4>
        <FormattedMessage id="proposal.detail.advancement" />
      </h4>
      {proposal ? (
        <ProposalDetailAdvancement proposal={proposal} />
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

export default createFragmentContainer(ProposalPageAdvancement, {
  proposal: graphql`
    fragment ProposalPageAdvancement_proposal on Proposal {
      ...ProposalDetailAdvancement_proposal
    }
  `,
});
