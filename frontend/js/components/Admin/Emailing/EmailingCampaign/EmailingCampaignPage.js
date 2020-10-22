// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import Loader from '~/components/Ui/FeedbacksIndicators/Loader';
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

const listCampaign = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?EmailingCampaignPageQueryResponse,
}) => {
  if (error) return graphqlError;

  if (props) {
    return (
      <PickableList.Provider>
        <DashboardCampaign query={props} />
      </PickableList.Provider>
    );
  }

  return <Loader />;
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
  const { parameters } = useDashboardCampaignContext();

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
          render={listCampaign}
        />
      </Content>
    </Container>
  );
};

export default EmailingCampaignPage;
