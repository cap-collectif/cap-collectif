// @flow
import * as React from 'react';
import { Panel, ListGroup } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { QueryRenderer, createFragmentContainer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
import ArgumentItem from './ArgumentItem';
import type { UnpublishedArgumentListQueryResponse } from './__generated__/UnpublishedArgumentListQuery.graphql';
import type { ArgumentList_argumentable } from './__generated__/ArgumentList_argumentable.graphql';
import type { State } from '../../types';

type Props = {
  argumentable: ArgumentList_argumentable,
  isAuthenticated: boolean,
  type: 'FOR' | 'AGAINST' | 'SIMPLE',
};

export class UnpublishedUnpublishedArgumentList extends React.Component<Props> {
  render() {
    const { type, isAuthenticated } = this.props;
    return (
      <div id={`opinion__unpublished--arguments--${type}`} className="block--tablet">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query UnpublishedArgumentListQuery(
              $argumentableId: ID!
              $isAuthenticated: Boolean!
              $type: ArgumentValue!
            ) {
              argumentable: node(id: $argumentableId) {
                ... on Argumentable {
                  viewerArgumentsUnpublished(first: 100, type: $type)
                    @include(if: $isAuthenticated)
                    @connection(
                      key: "UnpublishedArgumentList_viewerArgumentsUnpublished"
                      filters: ["type"]
                    ) {
                    totalCount
                    edges {
                      node {
                        id
                        ...ArgumentItem_argument
                          @arguments(isAuthenticated: $isAuthenticated, type: $type)
                      }
                    }
                  }
                }
              }
            }
          `}
          variables={{
            isAuthenticated,
            argumentableId: this.props.argumentable.id,
            type: type === 'SIMPLE' ? 'FOR' : type,
          }}
          render={({ props }: { props: ?UnpublishedArgumentListQueryResponse } & ReadyState) => {
            if (props) {
              const argumentable = props.argumentable;
              if (!argumentable || !argumentable.viewerArgumentsUnpublished) {
                return graphqlError;
              }
              if (
                argumentable.viewerArgumentsUnpublished.totalCount === 0 ||
                !argumentable.viewerArgumentsUnpublished.edges
              ) {
                return null;
              }
              return (
                <Panel bsStyle="danger">
                  <Panel.Heading>
                    <Panel.Title>
                      <strong>
                        <FormattedMessage
                          id={`count-arguments-${type === 'AGAINST' ? 'against' : 'for'}`}
                          values={{ num: argumentable.viewerArgumentsUnpublished.totalCount }}
                        />
                      </strong>{' '}
                      <FormattedMessage id="awaiting-publication-lowercase" />
                    </Panel.Title>
                  </Panel.Heading>
                  <ListGroup>
                    {argumentable.viewerArgumentsUnpublished.edges
                      .filter(Boolean)
                      .map(edge => edge.node)
                      .filter(Boolean)
                      .map(argument => {
                        // $FlowFixMe
                        return <ArgumentItem key={argument.id} argument={argument} />;
                      })}
                  </ListGroup>
                </Panel>
              );
            }
            return null;
          }}
        />
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  isAuthenticated: !!state.user.user,
});
const container = connect(mapStateToProps)(UnpublishedUnpublishedArgumentList);

export default createFragmentContainer(container, {
  argumentable: graphql`
    fragment UnpublishedArgumentList_argumentable on Argumentable {
      id
    }
  `,
});
