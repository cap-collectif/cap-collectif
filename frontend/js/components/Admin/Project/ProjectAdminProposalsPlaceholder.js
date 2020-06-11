// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { TextRow } from 'react-placeholder/lib/placeholders';
import styled, { type StyledComponent } from 'styled-components';
import AnalysisPlaceholderDashboard, {
  TYPE_DASHBOARD,
} from '~/components/Analysis/AnalysisPlaceholderdDashboard/AnalysisPlaceholderDashboard';
import type { ProposalsStateValues } from '~/components/Admin/Project/ProjectAdminPage.reducer';
import colors from '~/utils/colors';

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

  .text-row {
    margin-top: 0 !important;
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
        </div>
        <div>
          <TextRow color="#fff" style={{ width: 100, height: 30, marginRight: 15 }} />
          <TextRow color="#fff" style={{ width: 250, height: 30 }} />
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
