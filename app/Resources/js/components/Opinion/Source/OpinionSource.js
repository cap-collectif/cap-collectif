// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Media, ListGroupItem } from 'react-bootstrap';
import UserAvatar from '../../User/UserAvatar';
import OpinionInfos from '../OpinionInfos';
import OpinionSourceTitle from './OpinionSourceTitle';
import OpinionSourceContent from './OpinionSourceContent';
import OpinionSourceButtons from './OpinionSourceButtons';
import type { OpinionSource_source } from '~relay/OpinionSource_source.graphql';
import type { OpinionSource_sourceable } from '~relay/OpinionSource_sourceable.graphql';
import TrashedMessage from '../../Trashed/TrashedMessage';

type Props = {
  source: OpinionSource_source,
  sourceable: OpinionSource_sourceable,
};

export class OpinionSource extends React.Component<Props> {
  render() {
    const { source, sourceable } = this.props;
    return (
      <ListGroupItem
        className={`list-group-item__opinion ${
          source.author && source.author.vip ? ' bg-vip' : ''
        }`}
        id={`source-${source.id}`}>
        <Media>
          <Media.Left>
            {/* $FlowFixMe Will be a fragment soon */}
            <UserAvatar user={source.author} />
          </Media.Left>
          <Media.Body>
            {/* $FlowFixMe $refType */}
            <TrashedMessage contribution={source}>
              {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
              <OpinionInfos rankingThreshold={null} opinion={source} />
              {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
              <OpinionSourceTitle source={source} />
              {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
              <OpinionSourceContent source={source} />
              {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
              <div className="small">
                <OpinionSourceButtons sourceable={sourceable} source={source} />
              </div>
            </TrashedMessage>
          </Media.Body>
        </Media>
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(OpinionSource, {
  source: graphql`
    fragment OpinionSource_source on Source
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      id
      ...OpinionInfos_opinion
      ...OpinionSourceTitle_source
      ...OpinionSourceContent_source
      ...OpinionSourceButtons_source @arguments(isAuthenticated: $isAuthenticated)
      ...TrashedMessage_contribution
      author {
        id
        displayName
        vip
        url
        media {
          url
        }
      }
    }
  `,
  sourceable: graphql`
    fragment OpinionSource_sourceable on Sourceable
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      ...OpinionSourceButtons_sourceable @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
