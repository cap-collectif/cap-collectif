// @flow
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import Providers from './Providers';
import RedirectIoAdminPage from '~/components/User/Admin/RedirectIoAdminPage';
import type {
  RedirectIoAdminPageAppQueryResponse,
  RedirectIoAdminPageAppQueryVariables,
} from '~relay/RedirectIoAdminPageAppQuery.graphql';
import environment, { graphqlError } from '~/createRelayEnvironment';

export default () => (
  <Providers>
    <QueryRenderer
      variables={
        ({
          keyname: 'redirectionio.project.id',
        }: RedirectIoAdminPageAppQueryVariables)
      }
      environment={environment}
      query={graphql`
        query RedirectIoAdminPageAppQuery($keyname: String!) {
          projectKey: siteParameter(keyname: $keyname) {
            value
          }
        }
      `}
      render={({
        error,
        props,
      }: {
        ...ReactRelayReadyState,
        props: ?RedirectIoAdminPageAppQueryResponse,
      }) => {
        if (error) {
          return graphqlError;
        }
        if (props) {
          if (props.projectKey) {
            return <RedirectIoAdminPage {...props} />;
          }
          return graphqlError;
        }
        return null;
      }}
    />
  </Providers>
);
