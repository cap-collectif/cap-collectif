// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import ListCustomSSO from './ListCustomSSO';
import ListPublicSSO from './ListPublicSSO';
import type { ListCustomSSO_ssoConfigurations } from '~relay/ListCustomSSO_ssoConfigurations.graphql';
import type { FeatureToggles, State } from '../../../types';

type RelayProps = {|
  +ssoConfigurations: ListCustomSSO_ssoConfigurations,
|};

type Props = {|
  ...RelayProps,
  features: FeatureToggles,
  isSuperAdmin: boolean,
|};

export class ListSSOConfiguration extends React.Component<Props> {
  render() {
    const { ssoConfigurations, features, isSuperAdmin } = this.props;

    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="method" />
          </h3>
        </div>
        <div className="box-content box-content__content-form">
          {features.list_sso && isSuperAdmin && (
            <>
              <h4>
                <FormattedMessage id="other_step" />
              </h4>
              <ListCustomSSO ssoConfigurations={ssoConfigurations} />
            </>
          )}
          <div className={features.list_sso ? 'mt-30' : ''}>
            <h4>
              <FormattedMessage id="preconfigured" />
            </h4>
            <ListPublicSSO />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
});

export default connect(mapStateToProps)(
  createFragmentContainer(ListSSOConfiguration, {
    ssoConfigurations: graphql`
      fragment ListSSOConfiguration_ssoConfigurations on InternalSSOConfigurationConnection {
        ...ListCustomSSO_ssoConfigurations
      }
    `,
  }),
);
