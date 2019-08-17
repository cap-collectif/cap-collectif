// @flow
import * as React from 'react';
import ShieldAdminForm from './ShieldAdminForm';
import ListSSOConfiguration from './ListSSOConfiguration';
import type { ShieldAdminForm_shieldAdminForm } from '~relay/ShieldAdminForm_shieldAdminForm.graphql';
import type { ListCustomSSO_ssoConfigurations } from '~relay/ListCustomSSO_ssoConfigurations.graphql';

type RelayProps = {|
  +shieldAdminForm: ShieldAdminForm_shieldAdminForm,
  +ssoConfigurations: ListCustomSSO_ssoConfigurations,
|};

type Props = {|
  ...RelayProps,
|};

export class AuthentificationAdminPageContent extends React.Component<Props> {
  render() {
    const { shieldAdminForm, ssoConfigurations } = this.props;

    return (
      <>
        <ShieldAdminForm shieldAdminForm={shieldAdminForm} />
        <ListSSOConfiguration ssoConfigurations={ssoConfigurations} />
      </>
    );
  }
}

export default AuthentificationAdminPageContent;
