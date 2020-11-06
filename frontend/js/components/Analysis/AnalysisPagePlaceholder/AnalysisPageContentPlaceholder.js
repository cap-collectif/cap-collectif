// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage, useIntl, type IntlShape } from 'react-intl';
import { TextRow } from 'react-placeholder/lib/placeholders';
import ProjectAnalysisPreviewPlaceholder from '~/components/Project/Preview/ProjectAnlysisPreviewPlaceholder/ProjectAnalysisPreviewPlaceholder';
import AnalysisPageContainerPlaceholder from './AnalysisPageContainerPlaceholder';
import AnalysisPlaceholderDashboard, {
  TYPE_DASHBOARD,
} from '~/components/Analysis/AnalysisPlaceholderdDashboard/AnalysisPlaceholderDashboard';
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery';
import colors from '~/utils/colors';
import type { StateValues } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer';

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header: StyledComponent<{ hasMarge: boolean }, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: column;
  margin: ${props => (props.hasMarge ? '0 2rem 10px 2rem' : '0 0 10px 0')};

  h2 {
    font-size: 18px;
    font-weight: bold;
    color: #000;
    margin: 0 0 20px 0;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tabs {
    display: flex;
    flex-direction: row;
    opacity: 0.5;
  }

  span {
    margin-right: 10px;
  }
`;

const Tab: StyledComponent<{ selected: boolean }, {}, HTMLSpanElement> = styled.span`
  color: ${props => (props.selected ? colors.primaryColor : '#000')};
  font-weight: ${props => (props.selected ? 600 : 400)};
`;

type Props = {
  isProjectPage?: boolean,
  fetchData: ?() => void,
  hasError: boolean,
  selectedTab?: StateValues,
};

const renderContent = ({ isProjectPage, fetchData, hasError }: Props) => {
  if (isProjectPage) {
    const fakeProjects = new Array(3).fill(null);

    if (hasError) return <ErrorQuery retry={fetchData} />;
    return fakeProjects.map((preview, idx) => <ProjectAnalysisPreviewPlaceholder key={idx} />);
  }

  if (!isProjectPage) {
    return (
      <AnalysisPlaceholderDashboard
        type={TYPE_DASHBOARD.ANALYSIS}
        hasError={hasError}
        fetchData={fetchData}
      />
    );
  }
};

const renderHeader = (intl: IntlShape, isProjectPage?: boolean, selectedTab: ?string) => {
  if (!isProjectPage && selectedTab) {
    return (
      <>
        <TextRow color={colors.borderColor} style={{ width: 250, height: 30, marginBottom: 30 }} />

        <div className="header">
          <div className="tabs">
            <Tab selected={selectedTab === 'TODO'}>
              {intl.formatMessage({ id: 'front.fast.filter.skeleton.to-do' })}
            </Tab>
            <Tab selected={selectedTab === 'DONE'}>
              {intl.formatMessage({ id: 'front.fast.filter.skeleton.done' })}
            </Tab>
            <Tab selected={selectedTab === 'ALL'}>
              {intl.formatMessage({ id: 'front.fast.filter.skeleton.all' })}
            </Tab>
          </div>

          <TextRow color={colors.borderColor} style={{ width: 250, height: 30 }} />
        </div>
      </>
    );
  }

  return <FormattedMessage tagName="h2" id="my-projects" />;
};

const AnalysisPageContentPlaceholder = ({
  isProjectPage,
  fetchData,
  hasError,
  selectedTab,
}: Props) => {
  const intl = useIntl();

  return (
    <AnalysisPageContainerPlaceholder>
      <Header hasMarge={!isProjectPage}>{renderHeader(intl, isProjectPage, selectedTab)}</Header>
      <Container>{renderContent({ isProjectPage, fetchData, hasError })}</Container>
    </AnalysisPageContainerPlaceholder>
  );
};

export default AnalysisPageContentPlaceholder;
