// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay';
import ReactPlaceholder from 'react-placeholder';
import environment from '~/createRelayEnvironment';
import { Container, Header, Content } from './EmailingCampaignPage.style';
import DashboardCampaign from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign';
import PickableList from '~ui/List/PickableList';
import type { DashboardParameters } from './DashboardCampaign/DashboardCampaign.reducer';
import { useDashboardCampaignContext } from './DashboardCampaign/DashboardCampaign.context';
import type { EmailingCampaignPageQueryResponse } from '~relay/EmailingCampaignPageQuery.graphql';
import DashboardCampaignPlaceholder from './DashboardCampaignPlaceholder/DashboardCampaignPlaceholder';
import Flex from '~ui/Primitives/Layout/Flex';
import Tag from '~ds/Tag/Tag';
import Button from '~ds/Button/Button';
import { ICON_NAME } from '~ds/Icon/Icon';
import { createQueryVariables } from './utils';

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

export const EmailingCampaignPage = () => {
  const { parameters, dispatch } = useDashboardCampaignContext();
  const intl = useIntl();

  React.useEffect(() => {
    dispatch({
      type: 'INIT_FILTERS_FROM_URL',
    });
  }, [dispatch]);

  return (
    <Container className="emailing-campaign-page">
      <Header>
        <Flex direction="row">
          <FormattedMessage id="admin-menu-campaign-list" tagName="h2" />
          <Tag variant="yellow" ml={2}>
            {intl.formatMessage({ id: 'global.beta' })}
          </Tag>
        </Flex>

        <Button
          leftIcon={ICON_NAME.CIRCLE_INFO}
          variant="link"
          variantColor="primary"
          onClick={() => {
            window.location.href = intl.formatMessage({
              id: 'admin.help.link.emailing',
            });
          }}>
          {intl.formatMessage({ id: 'about-campaigns' })}
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
