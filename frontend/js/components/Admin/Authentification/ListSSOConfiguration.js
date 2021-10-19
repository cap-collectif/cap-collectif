// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, useFragment} from 'react-relay';
import { FormattedMessage } from 'react-intl';
import ListCustomSSO from './ListCustomSSO';
import ListPublicSSO from './ListPublicSSO';
import type { ListSSOConfiguration_query } from '~relay/ListSSOConfiguration_query.graphql';
import type { State } from '~/types';

type RelayProps = {|
  +query: ListSSOConfiguration_query,
|};

type Props = {|
  ...RelayProps,
  isSuperAdmin: boolean,
|};


const FRAGMENT = graphql`
    fragment ListSSOConfiguration_query on Query
    {
        ...ListCustomSSO_query
        ...ListPublicSSO_query
    }
`;

export const ListSSOConfiguration = ({ query: queryFragment, isSuperAdmin }: Props) => {

  const query = useFragment(FRAGMENT, queryFragment);

  return (
    <div className="box box-primary container-fluid">
      <div className="box-header">
        <h3 className="box-title">
          <FormattedMessage id="method" />
        </h3>
      </div>
      <div className="box-content box-content__content-form">
        {isSuperAdmin && (
          <>
            <h4>
              <FormattedMessage id="global.custom.feminine" />
            </h4>
            <ListCustomSSO query={query} />
          </>
        )}
        <div className={isSuperAdmin ? 'mt-30' : ''}>
          <h4>
            <FormattedMessage id="preconfigured" />
          </h4>
          <ListPublicSSO query={query} />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: State) => ({
  isSuperAdmin: !!(state.user.user && state.user.user.roles.includes('ROLE_SUPER_ADMIN')),
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ListSSOConfiguration);
