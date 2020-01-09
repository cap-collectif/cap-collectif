// @flow
import * as React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { LocaleAdminContainerQueryResponse } from '~relay/LocaleAdminContainerQuery.graphql';

import LocaleAdminForm from './LocaleAdminForm';
import Loader from '~/components/Ui/FeedbacksIndicators/Loader';

const renderList = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?LocaleAdminContainerQueryResponse,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props !== null) {
      return <LocaleAdminForm query={props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export const LocaleAdminContainer = () => (
  <>
    <QueryRenderer
      environment={environment}
      query={graphql`
        query LocaleAdminContainerQuery {
          ...LocaleAdminForm_query
        }
      `}
      variables={{}}
      render={renderList}
    />
  </>
);

export default LocaleAdminContainer;
