// @flow
import * as React from 'react';
import ShieldAdminForm from './ShieldAdminForm';
import ListSSOConfiguration from './ListSSOConfiguration';
import type { ShieldAdminForm_shieldAdminForm } from '~relay/ShieldAdminForm_shieldAdminForm.graphql';
import type { ListSSOConfiguration_ssoConfigurations } from '~relay/ListSSOConfiguration_ssoConfigurations.graphql';

type Props = {|
  +shieldAdminForm: ShieldAdminForm_shieldAdminForm,
  +ssoConfigurations: ListSSOConfiguration_ssoConfigurations,
|};

export class AuthentificationAdminPageContent extends React.Component<Props> {
  render() {
    const { shieldAdminForm, ssoConfigurations } = this.props;

    return (
      <>
        <ShieldAdminForm shieldAdminForm={shieldAdminForm} />
        {/* $FlowFixMe TODO fix the props */}
        <ListSSOConfiguration ssoConfigurations={ssoConfigurations} />
      </>
    );
  }
}

export default AuthentificationAdminPageContent;
