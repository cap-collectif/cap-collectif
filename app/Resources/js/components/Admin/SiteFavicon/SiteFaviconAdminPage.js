// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { type ReadyState, QueryRenderer, graphql } from 'react-relay';
import SiteFaviconAdminForm from './SiteFaviconAdminForm';
import { type SiteFaviconAdminPageQueryResponse } from './__generated__/SiteFaviconAdminPageQuery.graphql';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

const siteFaviconAdminForm = ({
  error,
  props,
}: { props?: ?SiteFaviconAdminPageQueryResponse } & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.siteFavicon) {
      return <SiteFaviconAdminForm {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export const SiteFaviconAdminPage = () => (
  <div className="box box-primary container-fluid">
    <div className="box-header">
      <h3 className="box-title">
        <FormattedMessage id="website-icon" />
      </h3>
    </div>
    <div className="box-content">
      <QueryRenderer
        environment={environment}
        query={graphql`
          query SiteFaviconAdminPageQuery {
            siteFavicon {
              ...SiteFaviconAdminForm_siteFavicon
            }
          }
        `}
        variables={{}}
        render={siteFaviconAdminForm}
      />
    </div>
  </div>
);

export default SiteFaviconAdminPage;
