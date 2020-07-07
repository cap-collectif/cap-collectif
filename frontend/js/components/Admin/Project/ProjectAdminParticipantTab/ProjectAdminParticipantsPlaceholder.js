// @flow
import * as React from 'react';
import { TextRow } from 'react-placeholder/lib/placeholders';
import styled, { type StyledComponent } from 'styled-components';
import AnalysisPlaceholderDashboard, {
  TYPE_DASHBOARD,
} from '~/components/Analysis/AnalysisPlaceholderdDashboard/AnalysisPlaceholderDashboard';

type Props = {|
  hasError: boolean,
  fetchData: ?() => void,
|};

const Header: StyledComponent<{}, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
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

const ProjectAdminProposalsPlaceholder = ({ hasError, fetchData }: Props) => (
  <>
    <Header>
      <TextRow color="#fff" style={{ width: 100, height: 30, marginRight: 15 }} />
      <TextRow color="#fff" style={{ width: 250, height: 30 }} />
    </Header>
    <AnalysisPlaceholderDashboard
      type={TYPE_DASHBOARD.BO_PARTICIPANT}
      hasError={hasError}
      fetchData={fetchData}
    />
  </>
);

export default ProjectAdminProposalsPlaceholder;
