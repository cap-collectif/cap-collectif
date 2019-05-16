// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
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
  isProfile: boolean,
};

export class OpinionSource extends React.Component<Props> {
  static defaultProps = {
    isProfile: false,
  };

  render() {
    const { source, sourceable, isProfile } = this.props;
    return (
      <ListGroupItem
        className={`opinion list-group-item__opinion ${
          source.author && source.author.vip ? ' bg-vip' : ''
        }`}
        id={`source-${source.id}`}>
        <Media>
          {isProfile && (
            <p>
              <FormattedMessage id="admin.fields.opinion.link" />
              {' : '}
              <a href={sourceable ? sourceable.url : ''}>{sourceable ? sourceable.title : ''}</a>
            </p>
          )}
          <Media.Left>
            {/* $FlowFixMe Will be a fragment soon */}
            <UserAvatar user={source.author} />
          </Media.Left>
          <Media.Body className="opinion__body">
            {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
            <OpinionInfos rankingThreshold={null} opinion={source} />
            {/* $FlowFixMe $refType */}
            <TrashedMessage contribution={source}>
              {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
              <OpinionSourceTitle source={source} />
              {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
              <OpinionSourceContent source={source} />
            </TrashedMessage>
            {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
            <div className="small">
              <OpinionSourceButtons sourceable={sourceable} source={source} />
            </div>
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
      ... on Opinion {
        title
        url
      }
      ... on Version {
        title
        url
      }
    }
  `,
});
