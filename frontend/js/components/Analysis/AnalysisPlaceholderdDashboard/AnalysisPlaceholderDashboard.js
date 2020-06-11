// @flow
import * as React from 'react';
import AnalysisPlaceholderProposal from '~/components/Analysis/AnalysisPlaceholderProposal/AnalysisPlaceholderProposal';
import PickableList from '~ui/List/PickableList';
import HeaderAnalysis from './Analysis/Header';
import ContentAnalysis from './Analysis/Content';
import HeaderContribution from './Contribution/Header';
import ContentContribution from './Contribution/Content';
import { PickableHeader, ContentContainer } from './AnalysisPlaceholderDashboard.style';
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery';

export const TYPE_DASHBOARD: {
  BO_CONTRIBUTION: 'BO_CONTRIBUTION',
  BO_ANALYSIS: 'BO_ANALYSIS',
  ANALYSIS: 'ANALYSIS',
} = {
  BO_CONTRIBUTION: 'BO_CONTRIBUTION',
  BO_ANALYSIS: 'BO_ANALYSIS',
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
    case TYPE_DASHBOARD.ANALYSIS:
      return <HeaderAnalysis />;
    default:
      return null;
  }
};

const AnalysisPlaceholderDashboard = ({ type, fetchData, hasError }: Props) => (
  <PickableList style={{ margin: '0 2rem 2rem 2rem' }}>
    <PickableHeader disabled isSelectable={false}>
      {renderHeaderProposal(type)}
    </PickableHeader>

    <PickableList.Body>
      <ContentContainer>
        {hasError ? (
          <ErrorQuery retry={fetchData} />
        ) : (
          new Array(10).fill(null).map((value, idx) => (
            <AnalysisPlaceholderProposal rowKey={idx} key={idx}>
              {renderContentProposal(type)}
            </AnalysisPlaceholderProposal>
          ))
        )}
      </ContentContainer>
    </PickableList.Body>
  </PickableList>
);

export default AnalysisPlaceholderDashboard;
