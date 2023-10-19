import * as React from 'react'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import AnalysisPlaceholderDashboard, {
  TYPE_DASHBOARD,
} from '~/components/Analysis/AnalysisPlaceholderdDashboard/AnalysisPlaceholderDashboard'
import Skeleton from '~ds/Skeleton'

type Props = {
  hasError: boolean
  fetchData: (() => void) | null | undefined
}
const Header: StyledComponent<any, {}, HTMLElement> = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  margin: 1rem 2rem;
`

const ProjectAdminProposalsPlaceholder = ({ hasError, fetchData }: Props) => (
  <>
    <Header>
      <Skeleton.Text bg="white" width="100px" height="30px" mr={4} />
      <Skeleton.Text bg="white" width="250px" height="30px" mr={4} />
    </Header>
    <AnalysisPlaceholderDashboard type={TYPE_DASHBOARD.BO_PARTICIPANT} hasError={hasError} fetchData={fetchData} />
  </>
)

export default ProjectAdminProposalsPlaceholder
