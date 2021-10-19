// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import ShieldAdminForm from './ShieldAdminForm';
import ListSSOConfiguration from './ListSSOConfiguration';
import type { AuthentificationAdminPageContent_shieldAdminForm } from '~relay/AuthentificationAdminPageContent_shieldAdminForm.graphql';
import type { AuthentificationAdminPageContent_query } from '~relay/AuthentificationAdminPageContent_query.graphql';

type Props = {|
  +shieldAdminForm: AuthentificationAdminPageContent_shieldAdminForm,
  +query: AuthentificationAdminPageContent_query,
|};

export const AuthentificationAdminPageContent = ({ shieldAdminForm, query }: Props) => (
  <>
    <ShieldAdminForm shieldAdminForm={shieldAdminForm} />
    <ListSSOConfiguration query={query} />
  </>
);

export default createFragmentContainer(AuthentificationAdminPageContent, {
  shieldAdminForm: graphql`
    fragment AuthentificationAdminPageContent_shieldAdminForm on ShieldAdminForm {
      ...ShieldAdminForm_shieldAdminForm
    }
  `,
  query: graphql`
    fragment AuthentificationAdminPageContent_query on Query {
      ...ListSSOConfiguration_query
    }
  `,
});
