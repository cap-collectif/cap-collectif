import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import type { CampaignsStateValues } from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign.reducer'
import {
  Header,
  Tab,
  ContentContainer,
  PickableContainer,
  PickableHeader,
  Item,
} from './DashboardCampaignPlaceholder.style'
import PickableList from '~ui/List/PickableList'
import Collapsable from '~ui/Collapsable'
import ErrorQuery from '~/components/Error/ErrorQuery/ErrorQuery'
import Skeleton from '~ds/Skeleton'

type Props = {
  hasError: boolean
  fetchData: (() => void) | null | undefined
  selectedTab: CampaignsStateValues
}

const DashboardCampaignPlaceholder = ({ selectedTab, fetchData, hasError }: Props) => {
  const intl = useIntl()
  return (
    <>
      <Header>
        <div>
          <Tab selected={selectedTab === 'ALL'}>
            {intl.formatMessage(
              {
                id: 'filter.count.status.all',
              },
              {
                num: 0,
              },
            )}
          </Tab>
          <Tab selected={selectedTab === 'SENT'}>
            {intl.formatMessage(
              {
                id: 'filter.count.status.sent',
              },
              {
                num: 0,
              },
            )}
          </Tab>
          <Tab selected={selectedTab === 'PLANNED'}>
            {intl.formatMessage(
              {
                id: 'filter.count.status.planned',
              },
              {
                num: 0,
              },
            )}
          </Tab>
          <Tab selected={selectedTab === 'DRAFT'}>
            {intl.formatMessage(
              {
                id: 'filter.count.status.draft',
              },
              {
                num: 0,
              },
            )}
          </Tab>
        </div>
        <div>
          <Skeleton.Text size="lg" width="100px" bg="white" mr={4} />
          <Skeleton.Text size="lg" width="250px" bg="white" />
        </div>
      </Header>

      <PickableContainer>
        <PickableHeader disabled isSelectable={false}>
          <Collapsable align="right">
            <Collapsable.Button>
              <FormattedMessage id="argument.sort.label" />
            </Collapsable.Button>
          </Collapsable>
        </PickableHeader>

        <PickableList.Body>
          <ContentContainer>
            {hasError ? (
              <ErrorQuery retry={fetchData} />
            ) : (
              new Array(5).fill(null).map((value, idx) => (
                <Item key={idx}>
                  <Skeleton.Text size="md" width="250px" />
                  <Skeleton.Text size="md" width="100px" my={2} />
                  <Skeleton.Text size="md" width="200px" />
                </Item>
              ))
            )}
          </ContentContainer>
        </PickableList.Body>
      </PickableContainer>
    </>
  )
}

export default DashboardCampaignPlaceholder
