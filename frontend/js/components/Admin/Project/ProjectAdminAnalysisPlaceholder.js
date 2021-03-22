// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import AnalysisPlaceholderDashboard, {
  TYPE_DASHBOARD,
} from '~/components/Analysis/AnalysisPlaceholderdDashboard/AnalysisPlaceholderDashboard';
import Skeleton from '~ds/Skeleton';

type Props = {|
  hasError: boolean,
  fetchData: ?() => void,
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
  }
`;

const ProjectAdminAnalysisPlaceholder = ({ hasError, fetchData }: Props) => (
  <>
    <Header>
      <Skeleton.Text size="sm" bg="white" width="450px" />
      <div>
        <Skeleton.Text bg="white" width="100px" height={7} mr={4} />
        <Skeleton.Text bg="white" width="250px" height={7} mr={4} />
      </div>
    </Header>
    <AnalysisPlaceholderDashboard
      type={TYPE_DASHBOARD.BO_ANALYSIS}
      hasError={hasError}
      fetchData={fetchData}
    />
  </>
);

export default ProjectAdminAnalysisPlaceholder;
