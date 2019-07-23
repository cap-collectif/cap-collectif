// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import ShieldAdminForm from './ShieldAdminForm';
import ListSSOConfiguration from './ListSSOConfiguration';
import type { ShieldAdminForm_shieldAdminForm } from '~relay/ShieldAdminForm_shieldAdminForm.graphql';
import type { ListSSOConfiguration_ssoConfigurations } from '~relay/ListSSOConfiguration_ssoConfigurations.graphql';
import type { FeatureToggles, State } from '../../../types';

type RelayProps = {|
  +shieldAdminForm: ShieldAdminForm_shieldAdminForm,
  +ssoConfigurations: ListSSOConfiguration_ssoConfigurations,
|};

type Props = {|
  ...RelayProps,
  features: FeatureToggles,
|};

export class AuthentificationAdminPageContent extends React.Component<Props> {
  render() {
    const { shieldAdminForm, ssoConfigurations, features } = this.props;

    return (
      <>
        <ShieldAdminForm shieldAdminForm={shieldAdminForm} />
        {features.list_sso && <ListSSOConfiguration ssoConfigurations={ssoConfigurations} />}
      </>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(AuthentificationAdminPageContent);
