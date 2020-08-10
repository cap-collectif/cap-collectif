// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { useResize } from '@liinkiing/react-hooks';
import styled, { type StyledComponent } from 'styled-components';
import type { ProposalViewAnalysisPanel_proposal } from '~relay/ProposalViewAnalysisPanel_proposal.graphql';
import colors from '~/utils/colors';
import { bootstrapGrid } from '~/utils/sizes';
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel';
import { getLabelData } from './ProposalAnalysisUserRow';
import ProposalResponse from '../Page/ProposalResponse';

type Props = {|
  proposal: ProposalViewAnalysisPanel_proposal,
  userId: string,
|};

export const ResponsesView: StyledComponent<{ tooLate?: boolean }, {}, HTMLDivElement> = styled.div`
  padding: 30px;
  margin-top: 70px;
  opacity: ${props => props.tooLate && '.5'};
`;

export const CommentView: StyledComponent<
  { isLarge: boolean, tooLate?: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  width: ${props => `calc(100vw - (100vw - (45vw - (${props.isLarge ? '95px' : '120px'}))));`};
  background: ${colors.grayF4};
  padding: 20px;
  opacity: ${props => props.tooLate && '.5'};

  p {
    font-size: 16px;
    font-weight: 600;
  }
`;

export const ProposalViewAnalysisPanel = ({ proposal, userId }: Props) => {
  const { width } = useResize();
  const isLarge = width < bootstrapGrid.mdMax;
  const analysis = proposal.analyses?.find(a => a.updatedBy.id === userId);
  if (!analysis) return null;
  const { state } = analysis;
  const questions =
    proposal?.form?.analysisConfiguration?.evaluationForm?.questions.map(q => q.id) || [];
  const labelData = getLabelData(analysis.state);
  return (
    <>
      <ResponsesView tooLate={state === 'TOO_LATE'}>
        <ProposalAnalysisStatusLabel
          fontSize={14}
          iconSize={10}
          color={labelData.color}
          iconName={labelData.icon}
          text={labelData.text}
        />
        {analysis.responses
          ?.filter(Boolean)
          .filter(response => response.question)
          .filter(response => response.value)
          .filter(response => questions.includes(response.question.id))
          .map((response, index) => (
            <ProposalResponse key={index} response={response} />
          ))}
      </ResponsesView>
      <CommentView isLarge={isLarge} tooLate={state === 'TOO_LATE'}>
        <FormattedMessage tagName="p" id="global.comment" />
        <span>{analysis.comment}</span>
      </CommentView>
    </>
  );
};

export default createFragmentContainer(ProposalViewAnalysisPanel, {
  proposal: graphql`
    fragment ProposalViewAnalysisPanel_proposal on Proposal {
      id
      analyses {
        id
        updatedBy {
          id
        }
        comment
        state
        responses {
          ...responsesHelper_response @relay(mask: false)
          ...ProposalResponse_response
        }
      }
      form {
        analysisConfiguration {
          id
          evaluationForm {
            questions {
              id
            }
          }
        }
      }
    }
  `,
});
