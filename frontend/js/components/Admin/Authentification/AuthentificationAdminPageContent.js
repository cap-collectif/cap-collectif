// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import ShieldAdminForm from './ShieldAdminForm';
import ListSSOConfiguration from './ListSSOConfiguration';
import type { AuthentificationAdminPageContent_shieldAdminForm } from '~relay/AuthentificationAdminPageContent_shieldAdminForm.graphql';
import type { AuthentificationAdminPageContent_ssoConfigurations } from '~relay/AuthentificationAdminPageContent_ssoConfigurations.graphql';

type Props = {|
  +shieldAdminForm: AuthentificationAdminPageContent_shieldAdminForm,
  +ssoConfigurations: AuthentificationAdminPageContent_ssoConfigurations,
|};

export const AuthentificationAdminPageContent = ({ shieldAdminForm, ssoConfigurations }: Props) => (
  <>
    <ShieldAdminForm shieldAdminForm={shieldAdminForm} />
    {/* $FlowFixMe TODO fix the props */}
    <ListSSOConfiguration ssoConfigurations={ssoConfigurations} />
  </>
);

export default createFragmentContainer(AuthentificationAdminPageContent, {
  shieldAdminForm: graphql`
    fragment AuthentificationAdminPageContent_shieldAdminForm on ShieldAdminForm {
      ...ShieldAdminForm_shieldAdminForm
    }
  `,
  ssoConfigurations: graphql`
    fragment AuthentificationAdminPageContent_ssoConfigurations on SSOConfigurationConnection {
      ...ListSSOConfiguration_ssoConfigurations
    }
  `,
});
