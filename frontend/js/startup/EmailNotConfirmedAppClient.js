// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Providers from './Providers';
import environment from '../createRelayEnvironment';
import EmailNotConfirmedAlert from '../components/User/EmailNotConfirmedAlert';
import NewEmailNotConfirmedAlert from '../components/User/NewEmailNotConfirmedAlert';
import type { EmailNotConfirmedAppClientQueryResponse } from '~relay/EmailNotConfirmedAppClientQuery.graphql';

export default () => (
  <Providers>
    <QueryRenderer
      environment={environment}
      query={graphql`
        query EmailNotConfirmedAppClientQuery {
          viewer {
            ...EmailNotConfirmedAlert_viewer
            ...NewEmailNotConfirmedAlert_viewer
          }
        }
      `}
      variables={{}}
      render={({
        error,
        props,
      }: {
        ...ReactRelayReadyState,
        props: ?EmailNotConfirmedAppClientQueryResponse,
      }) => {
        if (error) {
          return null;
        }
        if (props && props.viewer) {
          return (
            <>
              <EmailNotConfirmedAlert viewer={props.viewer} />
              <NewEmailNotConfirmedAlert viewer={props.viewer} />
            </>
          );
        }
        return null;
      }}
    />
  </Providers>
);
