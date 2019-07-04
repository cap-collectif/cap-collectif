// @flow
import * as React from 'react';
import type { ReadyState } from 'react-relay';
import { graphql, QueryRenderer } from 'react-relay';
import ShieldAdminForm from './ShieldAdminForm';
import type { AuthentificationAdminPageQueryResponse } from '~relay/AuthentificationAdminPageQuery.graphql';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import SSOByPassAuthForm from './SSOByPassAuthForm';

const component = ({
  error,
  props,
}: {
  props: ?AuthentificationAdminPageQueryResponse,
} & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.shieldAdminForm !== null) {
      return <ShieldAdminForm {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class AuthentificationAdminPage extends React.Component<{}> {
  render() {
    return (
      <>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query AuthentificationAdminPageQuery {
              shieldAdminForm {
                ...ShieldAdminForm_shieldAdminForm
              }
            }
          `}
          variables={{}}
          render={component}
        />
        <SSOByPassAuthForm />
      </>
    );
  }
}

export default AuthentificationAdminPage;
