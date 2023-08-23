// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import styled, { type StyledComponent } from 'styled-components';
import AnalysisPlaceholderDashboard, {
  TYPE_DASHBOARD,
} from '~/components/Analysis/AnalysisPlaceholderdDashboard/AnalysisPlaceholderDashboard';
import type { ProposalsStateValues } from '~/components/Admin/Project/ProjectAdminPage.reducer';
import colors from '~/utils/colors';
import Skeleton from '~ds/Skeleton';

type Props = {|
  hasError: boolean,
  fetchData: ?() => void,
  selectedTab: ProposalsStateValues,
|};

const Header: StyledComponent<{}, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 2rem;

  > div {
    display: flex;
    flex-direction: row;

    &:first-of-type {
      opacity: 0.5;
    }
  }

  span {
    margin-right: 10px;
  }
`;

const Tab: StyledComponent<{ selected: boolean }, {}, HTMLSpanElement> = styled.span`
  color: ${props => (props.selected ? colors.primaryColor : '#000')};
  font-weight: ${props => (props.selected ? 600 : 400)};
`;

const ProjectAdminProposalsPlaceholder = ({ hasError, fetchData, selectedTab }: Props) => {
  const intl = useIntl();

  return (
    <>
      <Header>
        <div>
          <Tab selected={selectedTab === 'ALL'}>
            {intl.formatMessage({ id: 'fast.filter.skeleton.all' })}
          </Tab>
          <Tab selected={selectedTab === 'PUBLISHED'}>
            {intl.formatMessage({ id: 'fast.filter.skeleton.published' })}
          </Tab>
          <Tab selected={selectedTab === 'DRAFT'}>
            {intl.formatMessage({ id: 'fast.filter.skeleton.draft' })}
          </Tab>
          <Tab selected={selectedTab === 'TRASHED'}>
            {intl.formatMessage({ id: 'fast.filter.skeleton.trash' })}
          </Tab>
          <Tab selected={selectedTab === 'ARCHIVED'}>
            {intl.formatMessage({ id: 'fast.filter.skeleton.archived' })}
          </Tab>
        </div>
        <div>
          <Skeleton.Text bg="white" width="100px" height="30px" mr={4} />
          <Skeleton.Text bg="white" width="250px" height="30px" />
        </div>
      </Header>
      <AnalysisPlaceholderDashboard
        type={TYPE_DASHBOARD.BO_CONTRIBUTION}
        hasError={hasError}
        fetchData={fetchData}
      />
    </>
  );
};

export default ProjectAdminProposalsPlaceholder;
