// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import type { MapAdminPageQueryResponse } from '~relay/MapAdminPageQuery.graphql';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import MapboxAdminConfig from './MapboxAdminConfig';

const mapboxAdminConfig = ({
  error,
  props,
}: { props?: ?MapAdminPageQueryResponse } & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.mapToken) {
      return <MapboxAdminConfig {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

const MapAdminPage = () => (
  <div className="box box-primary container-fluid">
    <div className="box-header">
      <h3 className="box-title">
        <FormattedMessage id="customize" />
      </h3>
    </div>
    <div className="box-content">
      <QueryRenderer
        environment={environment}
        query={graphql`
          query MapAdminPageQuery($provider: MapTokenProvider!) {
            mapToken(provider: $provider) {
              ...MapboxAdminConfig_mapToken
            }
          }
        `}
        variables={{
          provider: 'MAPBOX',
        }}
        render={mapboxAdminConfig}
      />
    </div>
  </div>
);

export default MapAdminPage;
