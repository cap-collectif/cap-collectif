// @flow
import * as React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import moment from 'moment';
import Linkify from 'react-linkify';
import { ListGroupItem, Label } from 'react-bootstrap';
import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';
import ArgumentButtons from './ArgumentButtons';
import UnpublishedLabel from '../Publishable/UnpublishedLabel';
import type { ArgumentItem_argument } from './__generated__/ArgumentItem_argument.graphql';

type Props = {
  argument: ArgumentItem_argument,
};

class ArgumentItem extends React.Component<Props> {
  static defaultProps = {
    isProfile: false,
  };

  renderDate = () => {
    const argument = this.props.argument;
    if (!Modernizr.intl) {
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

  renderLabel = type => {
    const labelStyle = type === 'FOR' ? 'success' : 'danger';
    const labelValueTranslateId =
      type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against';

    return (
      <Label bsStyle={labelStyle} className={'label--right'}>
        <FormattedMessage id={labelValueTranslateId} />
      </Label>
    );
  };

  renderConsultationLink = consultation => {
    return (
      <p>
        <FormattedMessage id={'admin.fields.opinion.link'} />
        {' : '}
        {/* $FlowFixMe */}
        <a href={consultation.url}>{consultation.title}</a>
      </p>
    );
  };

  render() {
    const { argument } = this.props;
    const classes = classNames({
      opinion: true,
      'opinion--argument': true,
      'bg-vip': argument.author && argument.author.vip,
    });
    return (
      <ListGroupItem className={classes} id={`arg-${argument.id}`}>
        <div className="opinion__body">
          <UserAvatar user={argument.author} className="pull-left" />
          <div className="opinion__data">
            <p className="h5 opinion__user">
              <UserLink user={argument.author} />
              {isProfile && this.renderLabel(argument.type)}
            </p>
            {this.renderDate()}
            <UnpublishedLabel publishable={argument} />
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
      </ListGroupItem>
    );
  }
}

export default createFragmentContainer(
  ArgumentItem,
  graphql`
    fragment ArgumentItem_argument on Argument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!", defaultValue: true }) {
      ...UnpublishedLabel_publishable
      id
      createdAt
      publishedAt
      ...ArgumentButtons_argument @arguments(isAuthenticated: $isAuthenticated)
      author {
        id
        slug
        displayName
        show_url
        vip
        media {
          url
        }
      }
      body
    }
  `,
);
