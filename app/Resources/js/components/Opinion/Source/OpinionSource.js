// @flow
import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { ListGroupItem } from 'react-bootstrap';
import classNames from 'classnames';
import UserAvatar from '../../User/UserAvatar';
import OpinionInfos from '../OpinionInfos';
import OpinionSourceTitle from './OpinionSourceTitle';
import OpinionSourceContent from './OpinionSourceContent';
import OpinionSourceFooter from './OpinionSourceFooter';
import type { OpinionSource_source } from './__generated__/OpinionSource_source.graphql';

type Props = {
  source: OpinionSource_source,
};

class OpinionSource extends React.Component<Props> {
  render() {
    const { source } = this.props;
    const classes = classNames({
      opinion: true,
      'block--bordered': true,
      'bg-vip': source.author && source.author.vip,
    });
    return (
      <ListGroupItem className={classes} id={`source-${source.id}`}>
        <div className="opinion__body box">
          <UserAvatar user={source.author} className="pull-left" />
          <div className="opinion__data">
            <OpinionInfos rankingThreshold={null} opinion={source} />
            <OpinionSourceTitle source={source} />
            <OpinionSourceContent source={source} />
            <OpinionSourceFooter source={source} />
          </div>
        </div>
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(
  OpinionSource,
  graphql`
    fragment OpinionSource_source on Source {
      id
      createdAt
      updatedAt
      ...OpinionSourceTitle_source
      ...OpinionSourceContent_source
      ...OpinionSourceFooter_source
      author {
        id
        displayName
        vip
        media {
          url
        }
      }
    }
  `,
);
