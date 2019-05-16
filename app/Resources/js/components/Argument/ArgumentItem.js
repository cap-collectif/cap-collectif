// @flow
import * as React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import moment from 'moment';
import Linkify from 'react-linkify';
import { Label, ListGroupItem } from 'react-bootstrap';
import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';
import ArgumentButtons from './ArgumentButtons';
import UnpublishedLabel from '../Publishable/UnpublishedLabel';
import type { ArgumentItem_argument } from '~relay/ArgumentItem_argument.graphql';
import TrashedMessage from '../Trashed/TrashedMessage';

type Props = {
  argument: ArgumentItem_argument,
  isProfile: boolean,
};

export class ArgumentItem extends React.Component<Props> {
  static defaultProps = {
    isProfile: false,
  };

  renderDate = () => {
    const { argument } = this.props;

    if (typeof Modernizr === 'undefined' || !Modernizr.intl) {
      return null;
    }

    return (
      <p className="excerpt opinion__date">
        <FormattedDate
          value={moment(argument.publishedAt ? argument.publishedAt : argument.createdAt)}
          day="numeric"
          month="long"
          year="numeric"
          hour="numeric"
          minute="numeric"
        />
      </p>
    );
  };

  render() {
    const { argument, isProfile } = this.props;
    const classes = classNames({
      opinion: true,
      'opinion--argument': true,
      'bg-vip': argument.author && argument.author.vip,
    });

    const labelStyle = argument.type === 'FOR' ? 'success' : 'danger';
    const labelValueTranslateId =
      argument.type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against';

    return (
      <ListGroupItem className={classes} id={`arg-${argument.id}`}>
        <div className="opinion__body">
          {isProfile && (
            <p>
              <FormattedMessage id="admin.fields.opinion.link" />
              {' : '}
              <a href={argument.related ? argument.related.url : ''}>
                {argument.related ? argument.related.title : ''}
              </a>
            </p>
          )}
          {/* $FlowFixMe Will be a fragment soon */}
          <UserAvatar user={argument.author} className="pull-left" />

          <div className="opinion__data">
            <p className="h5 opinion__user">
              <UserLink user={argument.author} />
              {isProfile && (
                <Label bsStyle={labelStyle} className="label--right">
                  <FormattedMessage id={labelValueTranslateId} />
                </Label>
              )}
            </p>
            {this.renderDate()}
            <UnpublishedLabel publishable={argument} />
          </div>

          {/* $FlowFixMe $refType */}
          <TrashedMessage contribution={argument}>
            <p
              className="opinion__text"
              style={{
                overflow: 'hidden',
                float: 'left',
                width: '100%',
                wordWrap: 'break-word',
              }}>
              <Linkify properties={{ className: 'external-link' }}>{argument.body}</Linkify>
            </p>
          </TrashedMessage>
          {/* $FlowFixMe */}
          <ArgumentButtons argument={argument} />
        </div>
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(ArgumentItem, {
  argument: graphql`
    fragment ArgumentItem_argument on Argument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      ...TrashedMessage_contribution
      ...UnpublishedLabel_publishable
      id
      createdAt
      publishedAt
      ...ArgumentButtons_argument @arguments(isAuthenticated: $isAuthenticated)
      author {
        id
        slug
        displayName
        url
        vip
        media {
          url
        }
      }
      body
      type
      related {
        id
        url
        ... on Opinion {
          title
        }
        ... on Version {
          title
        }
      }
    }
  `,
});
