// @flow
import React, { lazy, Suspense } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import Providers from './Providers';
import type {
  RedirectIoAdminPageAppQueryResponse,
  RedirectIoAdminPageAppQueryVariables,
} from '~relay/RedirectIoAdminPageAppQuery.graphql';
import environment, { graphqlError } from '~/createRelayEnvironment';
import Loader from '~ui/FeedbacksIndicators/Loader';

const RedirectIoAdminPage = lazy(() => import(/* webpackChunkName: "RedirectIoAdminPage" */ '~/components/User/Admin/RedirectIoAdminPage'));

export default () => (
  <Suspense fallback={<Loader />}>
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
  </Suspense>
);
