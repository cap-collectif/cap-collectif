import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { QueryRenderer, graphql } from 'react-relay'
import { useSelector } from 'react-redux'
import environment from '~/createRelayEnvironment'
import { Container, Header, Content } from './EmailingCampaignPage.style'
import DashboardCampaign from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign'
import PickableList from '~ui/List/PickableList'
import type { DashboardParameters } from './DashboardCampaign/DashboardCampaign.reducer'
import { useDashboardCampaignContext } from './DashboardCampaign/DashboardCampaign.context'
import type { EmailingCampaignPageQueryResponse } from '~relay/EmailingCampaignPageQuery.graphql'
import DashboardCampaignPlaceholder from './DashboardCampaignPlaceholder/DashboardCampaignPlaceholder'
import Flex from '~ui/Primitives/Layout/Flex'
import Tag from '~ds/Tag/Tag'
import Button from '~ds/Button/Button'
import { ICON_NAME } from '~ds/Icon/Icon'
import { createQueryVariables } from './utils'
import Skeleton from '~ds/Skeleton'
import type { FeatureToggles, GlobalState } from '~/types'
import InfoMessage from '~ds/InfoMessage/InfoMessage'

const listCampaign = ({
  error,
  props,
  retry,
  parameters,
}: ReactRelayReadyState & {
  props: EmailingCampaignPageQueryResponse | null | undefined
  parameters: DashboardParameters
}) => {
  const viewer = props?.viewer
  const organization = viewer?.organizations?.[0]
  return (
    <Skeleton
      isLoaded={!!props}
      placeholder={
        <DashboardCampaignPlaceholder hasError={!!error} fetchData={retry} selectedTab={parameters.filters.state} />
      }
    >
      <PickableList.Provider>
        <DashboardCampaign viewer={viewer} emailingCampaignOwner={organization ?? viewer} />
      </PickableList.Provider>
    </Skeleton>
  )
}

export const EmailingCampaignPage = () => {
  const { parameters, dispatch } = useDashboardCampaignContext()
  const intl = useIntl()
  const { user } = useSelector((state: GlobalState) => state.user)
  const features: FeatureToggles = useSelector((state: GlobalState) => state.default.features)
  const isAdmin = user ? user.isAdmin : false
  const isSuperAdmin = user ? user.isSuperAdmin : false
  React.useEffect(() => {
    dispatch({
      type: 'INIT_FILTERS_FROM_URL',
    })
  }, [dispatch])
  return (
    <Container className="emailing-campaign-page">
      <Header>
        <Flex direction="row">
          <FormattedMessage id="admin-menu-campaign-list" tagName="h2" />
          <Tag variant="yellow" ml={2}>
            {intl.formatMessage({
              id: 'global.beta',
            })}
          </Tag>
        </Flex>

        {isSuperAdmin && (
          <InfoMessage variant={features?.mailjet_sandbox === true ? 'info' : 'danger'}>
            <InfoMessage.Content>
              {intl.formatMessage({
                id: `emailing-mailjet-sandbox-${features?.mailjet_sandbox === true ? 'on' : 'off'}`,
              })}
              &nbsp;
              <a href="/admin-next/features">Mailjet Sandbox</a>
            </InfoMessage.Content>
          </InfoMessage>
        )}

        <Button
          leftIcon={ICON_NAME.CIRCLE_INFO}
          variant="link"
          variantColor="primary"
          onClick={() => {
            window.location.href = intl.formatMessage({
              id: 'admin.help.link.emailing',
            })
          }}
        >
          {intl.formatMessage({
            id: 'about-campaigns',
          })}
        </Button>
      </Header>

      <Content>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query EmailingCampaignPageQuery(
              $count: Int
              $cursor: String
              $term: String
              $orderBy: EmailingCampaignOrder
              $status: EmailingCampaignStatusFilter
              $affiliations: [EmailingCampaignAffiliation!]
            ) {
              viewer {
                ...DashboardCampaign_viewer
                ...DashboardCampaign_emailingCampaignOwner
                  @arguments(
                    count: $count
                    cursor: $cursor
                    term: $term
                    orderBy: $orderBy
                    status: $status
                    affiliations: $affiliations
                  )
                organizations {
                  ...DashboardCampaign_emailingCampaignOwner
                    @arguments(
                      count: $count
                      cursor: $cursor
                      term: $term
                      orderBy: $orderBy
                      status: $status
                      affiliations: $affiliations
                    )
                }
              }
            }
          `}
          variables={createQueryVariables(parameters, isAdmin)}
          render={({ error, props, retry }) =>
            listCampaign({
              error,
              props,
              retry,
              parameters,
            })
          }
        />
      </Content>
    </Container>
  )
}
export default EmailingCampaignPage
