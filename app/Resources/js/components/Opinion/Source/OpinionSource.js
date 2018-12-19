// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import UserAvatar from '../../User/UserAvatar';
import OpinionInfos from '../OpinionInfos';
import OpinionSourceTitle from './OpinionSourceTitle';
import OpinionSourceContent from './OpinionSourceContent';
import OpinionSourceButtons from './OpinionSourceButtons';
import type { OpinionSource_source } from './__generated__/OpinionSource_source.graphql';
import type { OpinionSource_sourceable } from './__generated__/OpinionSource_sourceable.graphql';

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
        <div className="left-block">
          {/* $FlowFixMe Will be a fragment soon */}
          <UserAvatar user={source.author} />
          <div>
            {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
            <OpinionInfos rankingThreshold={null} opinion={source} />
            {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
            <OpinionSourceTitle source={source} />
            {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
            <OpinionSourceContent source={source} />
            {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
            <div className="actions small">
              <OpinionSourceButtons sourceable={sourceable} source={source} />
            </div>
          </div>
        </div>
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
    fragment OpinionSource_sourceable on Sourceable {
      id
      ...OpinionSourceButtons_sourceable
    }
  `,
});
