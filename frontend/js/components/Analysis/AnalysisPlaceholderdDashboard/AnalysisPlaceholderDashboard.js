// @flow
import * as React from 'react';
import AnalysisPlaceholderProposal from '~/components/Analysis/AnalysisPlaceholderProposal/AnalysisPlaceholderProposal';
import PickableList from '~ui/List/PickableList';
import HeaderAnalysis from './Analysis/Header';
import ContentAnalysis from './Analysis/Content';
import HeaderContribution from './Contribution/Header';
import ContentContribution from './Contribution/Content';
import HeaderParticipant from './Participant/Header';
import { PickableContainer, PickableHeader } from './AnalysisPlaceholderDashboard.style';
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery';
import AnalysisPlaceholderParticipant from '~/components/Analysis/AnalysisPlaceholderParticipant/AnalysisPlaceholderParticipant';
import AppBox from '~ui/Primitives/AppBox';

export const TYPE_DASHBOARD: {
  BO_CONTRIBUTION: 'BO_CONTRIBUTION',
  BO_ANALYSIS: 'BO_ANALYSIS',
  BO_PARTICIPANT: 'BO_PARTICIPANT',
  ANALYSIS: 'ANALYSIS',
} = {
  BO_CONTRIBUTION: 'BO_CONTRIBUTION',
  BO_ANALYSIS: 'BO_ANALYSIS',
  BO_PARTICIPANT: 'BO_PARTICIPANT',
  ANALYSIS: 'ANALYSIS',
};

type Props = {
  type: $Values<typeof TYPE_DASHBOARD>,
  fetchData: ?() => void,
  hasError: boolean,
};

const renderContentProposal = (type: $Values<typeof TYPE_DASHBOARD>) => {
  switch (type) {
    case TYPE_DASHBOARD.BO_CONTRIBUTION:
      return <ContentContribution />;
    case TYPE_DASHBOARD.BO_ANALYSIS:
      return <ContentAnalysis isAdmin />;
    case TYPE_DASHBOARD.ANALYSIS:
      return <ContentAnalysis />;
    default:
      return null;
  }
};

const renderHeaderProposal = (type: $Values<typeof TYPE_DASHBOARD>) => {
  switch (type) {
    case TYPE_DASHBOARD.BO_CONTRIBUTION:
      return <HeaderContribution />;
    case TYPE_DASHBOARD.BO_ANALYSIS:
      return <HeaderAnalysis isAdmin />;
    case TYPE_DASHBOARD.BO_PARTICIPANT:
      return <HeaderParticipant />;
    case TYPE_DASHBOARD.ANALYSIS:
      return <HeaderAnalysis />;
    default:
      return null;
  }
};

const AnalysisPlaceholderDashboard = ({ type, fetchData, hasError }: Props) => {
  const isParticipant = type === TYPE_DASHBOARD.BO_PARTICIPANT;

  return (
    <PickableContainer>
      <PickableHeader disabled isSelectable={false}>
        {renderHeaderProposal(type)}
      </PickableHeader>

      <PickableList.Body>
        <AppBox bg="white">
          {hasError ? (
            <ErrorQuery retry={fetchData} />
          ) : (
            new Array(10)
              .fill(null)
              .map((value, idx) =>
                isParticipant ? (
                  <AnalysisPlaceholderParticipant rowKey={idx} key={idx} />
                ) : (
                  <AnalysisPlaceholderProposal key={idx}>
                    {renderContentProposal(type)}
                  </AnalysisPlaceholderProposal>
                ),
              )
          )}
        </AppBox>
      </PickableList.Body>
    </PickableContainer>
  );
};

export default AnalysisPlaceholderDashboard;
