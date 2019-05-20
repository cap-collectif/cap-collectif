// @flow
import * as React from 'react';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Panel, ListGroup } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import ArgumentItem from './ArgumentItem';
import type { UnpublishedArgumentList_argumentable } from '~relay/UnpublishedArgumentList_argumentable.graphql';
import type { ArgumentType } from '../../types';

type Props = {|
  +argumentable: UnpublishedArgumentList_argumentable,
  +type: ArgumentType,
|};

export class UnpublishedArgumentList extends React.Component<Props> {
  render() {
    const { type, argumentable } = this.props;
    if (
      !argumentable.viewerArgumentsUnpublished ||
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
            .map(argument => (
              // $FlowFixMe
              <ArgumentItem key={argument.id} argument={argument} />
            ))}
        </ListGroup>
      </Panel>
    );
  }
}

export default createFragmentContainer(UnpublishedArgumentList, {
  argumentable: graphql`
    fragment UnpublishedArgumentList_argumentable on Argumentable {
      viewerArgumentsUnpublished(first: 100, type: $type)
        @include(if: $isAuthenticated)
        @connection(key: "UnpublishedArgumentList_viewerArgumentsUnpublished", filters: ["type"]) {
        totalCount
        edges {
          node {
            id
            ...ArgumentItem_argument @arguments(isAuthenticated: $isAuthenticated)
          }
        }
      }
    }
  `,
});
