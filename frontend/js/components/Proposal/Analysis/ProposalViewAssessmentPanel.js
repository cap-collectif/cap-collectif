// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import type { ProposalViewAssessmentPanel_proposal } from '~relay/ProposalViewAssessmentPanel_proposal.graphql';
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel';
import { getLabelData } from './ProposalAnalysisUserRow';
import { ResponsesView } from './ProposalViewAnalysisPanel';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type Props = {|
  proposal: ProposalViewAssessmentPanel_proposal,
|};

export const AssessmentView: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  p {
    font-size: 16px;
    margin-top: 20px;
    font-weight: 600;
    margin-bottom: 0;
  }

  span + div {
    margin-top: 20px;
  }
`;

export const ResponseContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  > p {
    font-size: 16px;
    margin-top: 20px;
    font-weight: 600;
    margin-bottom: 0;
  }
`;

export const ProposalViewAssessmentPanel = ({ proposal }: Props) => {
  if (!proposal?.assessment) return null;
  const { assessment } = proposal;

  const labelData = getLabelData(assessment.state);
  return (
    <>
      <ResponsesView>
        <AssessmentView>
          <ProposalAnalysisStatusLabel
            fontSize={14}
            iconSize={10}
            color={labelData.color}
            iconName={labelData.icon}
            text={labelData.text}
          />
          {assessment.body ? <WYSIWYGRender value={assessment.body} /> : null}
          {assessment.estimatedCost !== null ? (
            <>
              <FormattedMessage tagName="p" id="global.estimation" />
              {assessment.estimatedCost} €
            </>
          ) : null}
        </AssessmentView>
        {assessment.officialResponse ? (
          <ResponseContainer>
            <FormattedMessage tagName="p" id="official.reply.draft" />
            <WYSIWYGRender value={assessment.officialResponse} />
          </ResponseContainer>
        ) : null}
      </ResponsesView>
    </>
  );
};

export default createFragmentContainer(ProposalViewAssessmentPanel, {
  proposal: graphql`
    fragment ProposalViewAssessmentPanel_proposal on Proposal {
      id
      assessment {
        id
        state
        estimatedCost
        body
        officialResponse
      }
    }
  `,
});
