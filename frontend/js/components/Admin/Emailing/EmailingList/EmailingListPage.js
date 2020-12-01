// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import ReactPlaceholder from 'react-placeholder';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '~/createRelayEnvironment';
import type {
  EmailingListPageQueryResponse,
  EmailingListPageQueryVariables,
} from '~relay/EmailingListPageQuery.graphql';
import { Container, Header, Content } from './EmailingListPage.style';
import { useDashboardMailingListContext } from './DashboardMailingList/DashboardMailingList.context';
import PickableList from '~ui/List/PickableList';
import DashboardMailingList, {
  MAILING_LIST_PAGINATION,
} from '~/components/Admin/Emailing/EmailingList/DashboardMailingList/DashboardMailingList';
import type { DashboardParameters } from '~/components/Admin/Emailing/EmailingList/DashboardMailingList/DashboardMailingList.reducer';
import DashboardMailingListPlaceholder from './DashboardMailingListPlaceholder/DashboardMailingListPlaceholder';

const listMailingList = ({
  error,
  props,
  retry,
}: {
  ...ReactRelayReadyState,
  props: ?EmailingListPageQueryResponse,
}) => {
  if (props) {
    return (
      <PickableList.Provider>
        <DashboardMailingList query={props} />
      </PickableList.Provider>
    );
  }

  return (
    <ReactPlaceholder
      ready={false}
      customPlaceholder={<DashboardMailingListPlaceholder hasError={!!error} fetchData={retry} />}
    />
  );
};

export const createQueryVariables = (
  parameters: DashboardParameters,
): EmailingListPageQueryVariables => ({
  count: MAILING_LIST_PAGINATION,
  cursor: null,
  term: parameters.filters.term,
});

export const EmailingListPage = () => {
  const { parameters, dispatch } = useDashboardMailingListContext();

  React.useEffect(() => {
    dispatch({
      type: 'INIT_FILTERS_FROM_URL',
    });
  }, [dispatch]);

  return (
    <Container className="emailing-mailingList-page">
      <Header>
        <FormattedMessage id="admin-menu-emailing-list" tagName="h2" />
      </Header>

      <Content>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query EmailingListPageQuery($count: Int, $cursor: String, $term: String) {
              ...DashboardMailingList_query @arguments(count: $count, cursor: $cursor, term: $term)
            }
          `}
          variables={createQueryVariables(parameters)}
          render={listMailingList}
        />
      </Content>
    </Container>
  );
};

export default EmailingListPage;
