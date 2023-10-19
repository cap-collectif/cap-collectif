import * as React from 'react'
import styled from 'styled-components'
import type { IntlShape } from 'react-intl'
import { FormattedMessage, useIntl } from 'react-intl'
import ProjectAnalysisPreviewPlaceholder from '~/components/Project/Preview/ProjectAnlysisPreviewPlaceholder/ProjectAnalysisPreviewPlaceholder'
import AnalysisPlaceholderDashboard, {
  TYPE_DASHBOARD,
} from '~/components/Analysis/AnalysisPlaceholderdDashboard/AnalysisPlaceholderDashboard'
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery'
import colors from '~/utils/colors'
import type { StateValues } from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer'
import Skeleton from '~ds/Skeleton'
import Flex from '~ui/Primitives/Layout/Flex'
import AppBox from '~ui/Primitives/AppBox'

const Header = styled.header<{
  hasMarge: boolean
}>`
  display: flex;
  flex-direction: column;
  margin: ${props => (props.hasMarge ? '0 2rem 10px 2rem' : '0 0 10px 0')};

  h2 {
    font-size: 18px;
    font-weight: bold;
    color: #000;
    margin: 0 0 20px 0;
  }

  span {
    margin-right: 10px;
  }
`
const Tab = styled.span<{
  selected: boolean
}>`
  color: ${props => (props.selected ? colors.primaryColor : '#000')};
  font-weight: ${props => (props.selected ? 600 : 400)};
`
type Props = {
  isIndexPage: boolean
  fetchData: (() => void) | null | undefined
  hasError: boolean
  selectedTab?: StateValues | null | undefined
}

const renderContent = ({ isIndexPage, fetchData, hasError }: Props) => {
  if (isIndexPage) {
    const fakeProjects = new Array(3).fill(null)
    if (hasError) return <ErrorQuery retry={fetchData} />
    return fakeProjects.map((preview, idx) => <ProjectAnalysisPreviewPlaceholder key={idx} />)
  }

  return <AnalysisPlaceholderDashboard type={TYPE_DASHBOARD.ANALYSIS} hasError={hasError} fetchData={fetchData} />
}

const renderHeader = (intl: IntlShape, isIndexPage: boolean, selectedTab: string | null | undefined) => {
  if (!isIndexPage && selectedTab) {
    return (
      <>
        <Skeleton.Text height="30px" width="250px" mb={7} />

        <Flex direction="row" align="center" justify="space-between">
          <Flex direction="row" opacity={0.5}>
            <Tab selected={selectedTab === 'TODO'}>
              {intl.formatMessage({
                id: 'front.fast.filter.skeleton.to-do',
              })}
            </Tab>
            <Tab selected={selectedTab === 'DONE'}>
              {intl.formatMessage({
                id: 'front.fast.filter.skeleton.done',
              })}
            </Tab>
            <Tab selected={selectedTab === 'ALL'}>
              {intl.formatMessage({
                id: 'front.fast.filter.skeleton.all',
              })}
            </Tab>
          </Flex>

          <Skeleton.Text height="30px" width="250px" />
        </Flex>
      </>
    )
  }

  return <FormattedMessage tagName="h2" id="my-projects" />
}

const AnalysisPageContentPlaceholder = ({ isIndexPage, fetchData, hasError, selectedTab }: Props) => {
  const intl = useIntl()
  return (
    <AppBox p="80px">
      <Header hasMarge={!isIndexPage}>{renderHeader(intl, isIndexPage, selectedTab)}</Header>
      <Flex direction="column">
        {renderContent({
          isIndexPage,
          fetchData,
          hasError,
        })}
      </Flex>
    </AppBox>
  )
}

export default AnalysisPageContentPlaceholder
