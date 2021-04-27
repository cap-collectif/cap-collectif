// @flow
import * as React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { connect } from 'react-redux';
import type { AuthentificationAdminPageQueryResponse } from '~relay/AuthentificationAdminPageQuery.graphql';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import SSOByPassAuthForm from './SSOByPassAuthForm';
import AuthentificationAdminPageContent from './AuthentificationAdminPageContent';
import type { FeatureToggles, State as GlobalState } from '~/types';

type Props = {|
  features: FeatureToggles,
|};

const component = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?AuthentificationAdminPageQueryResponse,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.shieldAdminForm !== null && props.ssoConfigurations !== null) {
      // $FlowFixMe
      return <AuthentificationAdminPageContent {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export const AuthentificationAdminPage = ({ features }: Props) => (
  <>
    <QueryRenderer
      environment={environment}
      query={graphql`
        query AuthentificationAdminPageQuery($isFranceConnectEnable: Boolean!) {
          shieldAdminForm {
            ...AuthentificationAdminPageContent_shieldAdminForm
          }
          ssoConfigurations {
            ...AuthentificationAdminPageContent_ssoConfigurations
              @arguments(isFranceConnectEnable: $isFranceConnectEnable)
          }
        }
      `}
      variables={{
        isFranceConnectEnable: features.login_franceconnect,
      }}
      render={component}
    />
    <SSOByPassAuthForm />
  </>
);

const mapStateToProps = (state: GlobalState) => ({
  features: state.default.features,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(AuthentificationAdminPage);
