// @flow
import * as React from 'react';
import type { ReadyState } from 'react-relay';
import { graphql, QueryRenderer } from 'react-relay';
import ShieldAdminForm from './ShieldAdminForm';
import type { ShieldmAdminPageQueryResponse } from '~relay/ShieldAdminPageQuery.graphql';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';

const component = ({
  error,
  props,
}: {
  props: ?ShieldmAdminPageQueryResponse,
} & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    // eslint-disable-next-line
    if (props.shieldAdminForm !== null) {
      return <ShieldAdminForm {...props} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

export class ShieldAdminPage extends React.Component<{}> {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ShieldAdminPageQuery {
            shieldAdminForm {
              ...ShieldAdminForm_shieldAdminForm
            }
          }
        `}
        variables={{}}
        render={component}
      />
    );
  }
}

export default ShieldAdminPage;
