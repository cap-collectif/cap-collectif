// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';
import ReactPlaceholder from 'react-placeholder';
import environment from '~/createRelayEnvironment';
import { Container, Header, Content } from './EmailingCampaignPage.style';
import DashboardCampaign, {
  CAMPAIGN_PAGINATION,
} from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign';
import PickableList from '~ui/List/PickableList';
import type { DashboardParameters } from './DashboardCampaign/DashboardCampaign.reducer';
import { useDashboardCampaignContext } from './DashboardCampaign/DashboardCampaign.context';
import type {
  EmailingCampaignPageQueryResponse,
  EmailingCampaignPageQueryVariables,
} from '~relay/EmailingCampaignPageQuery.graphql';
import { ORDER_BY } from './DashboardCampaign/DashboardCampaign.reducer';
import DashboardCampaignPlaceholder from './DashboardCampaignPlaceholder/DashboardCampaignPlaceholder';

const listCampaign = ({
  error,
  props,
  retry,
  parameters,
}: {
  ...ReactRelayReadyState,
  props: ?EmailingCampaignPageQueryResponse,
  parameters: DashboardParameters,
}) => {
  if (props) {
    return (
      <PickableList.Provider>
        <DashboardCampaign query={props} />
      </PickableList.Provider>
    );
  }

  return (
    <ReactPlaceholder
      ready={false}
      customPlaceholder={
        <DashboardCampaignPlaceholder
          hasError={!!error}
          fetchData={retry}
          selectedTab={parameters.filters.state}
        />
      }
    />
  );
};

export const createQueryVariables = (
  parameters: DashboardParameters,
): EmailingCampaignPageQueryVariables => ({
  count: CAMPAIGN_PAGINATION,
  cursor: null,
  term: parameters.filters.term,
  orderBy: {
    field: 'SEND_AT',
    direction: parameters.sort === ORDER_BY.NEWEST ? 'DESC' : 'ASC',
  },
  status: parameters.filters.state === 'ALL' ? null : parameters.filters.state,
});

export const EmailingCampaignPage = () => {
  const { parameters, dispatch } = useDashboardCampaignContext();

  React.useEffect(() => {
    dispatch({
      type: 'INIT_FILTERS_FROM_URL',
    });
  }, [dispatch]);

  return (
    <Container className="emailing-campaign-page">
      <Header>
        <FormattedMessage id="admin-menu-campaign-list" tagName="h2" />
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
            ) {
              ...DashboardCampaign_query
                @arguments(
                  count: $count
                  cursor: $cursor
                  term: $term
                  orderBy: $orderBy
                  status: $status
                )
            }
          `}
          variables={createQueryVariables(parameters)}
          render={({ error, props, retry }) => listCampaign({ error, props, retry, parameters })}
        />
      </Content>
    </Container>
  );
};

export default EmailingCampaignPage;
