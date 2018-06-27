// @flow
import React from 'react';
import { FormattedDate } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import moment from 'moment';
import Linkify from 'react-linkify';
import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';
import ArgumentButtons from './ArgumentButtons';
import type { ArgumentItem_argument } from './__generated__/ArgumentItem_argument.graphql';

type Props = {
  argument: ArgumentItem_argument,
};

class ArgumentItem extends React.Component<Props> {
  renderDate = () => {
    const argument = this.props.argument;
    if (!Modernizr.intl) {
      return null;
    }
    return (
      <p className="excerpt opinion__date">
        <FormattedDate
          value={moment(argument.createdAt)}
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
    const argument = this.props.argument;
    const classes = classNames({
      opinion: true,
      'opinion--argument': true,
      'bg-vip': argument.author && argument.author.vip,
    });
    return (
      <li className={classes} id={`arg-${argument.id}`}>
        <div className="opinion__body box">
          <UserAvatar user={argument.author} className="pull-left" />
          <div className="opinion__data">
            <p className="h5 opinion__user">
              <UserLink user={argument.author} />
            </p>
            {this.renderDate()}
          </div>
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
          <ArgumentButtons argument={argument} />
        </div>
      </li>
    );
  }
}

export default createFragmentContainer(
  ArgumentItem,
  graphql`
    fragment ArgumentItem_argument on Argument {
      id
      createdAt
      author {
        id
        slug
        displayName
        show_url
        vip
      }
      body
    }
  `,
);
