// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, createFragmentContainer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import UnpublishedArgumentList from './UnpublishedArgumentList';
import type { UnpublishedArgumentListRendererQueryResponse } from '~relay/UnpublishedArgumentListRendererQuery.graphql';
import type { UnpublishedArgumentListRenderer_argumentable } from '~relay/UnpublishedArgumentListRenderer_argumentable.graphql';
import type { ArgumentType, State } from '../../types';

type Props = {|
  +argumentable: UnpublishedArgumentListRenderer_argumentable,
  +isAuthenticated: boolean,
  +type: ArgumentType,
|};

export class UnpublishedArgumentListRenderer extends React.Component<Props> {
  render() {
    const { type, isAuthenticated } = this.props;
    return (
      <div id={`opinion__unpublished--arguments--${type}`} className="block--tablet">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query UnpublishedArgumentListRendererQuery(
              $argumentableId: ID!
              $isAuthenticated: Boolean!
              $type: ArgumentValue!
            ) {
              argumentable: node(id: $argumentableId) {
                id
                ...UnpublishedArgumentList_argumentable
              }
            }
          `}
          variables={{
            isAuthenticated,
            argumentableId: this.props.argumentable.id,
            type: type === 'SIMPLE' ? 'FOR' : type,
          }}
          render={({
            props,
            error,
          }: {
            ...ReactRelayReadyState,
            props: ?UnpublishedArgumentListRendererQueryResponse,
          }) => {
            if (error) {
              return graphqlError;
            }
            if (props && props.argumentable) {
              return <UnpublishedArgumentList type={type} argumentable={props.argumentable} />;
            }
            return null;
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
});
const container = connect(mapStateToProps)(UnpublishedArgumentListRenderer);

export default createFragmentContainer(container, {
  argumentable: graphql`
    fragment UnpublishedArgumentListRenderer_argumentable on Argumentable {
      id
    }
  `,
});
