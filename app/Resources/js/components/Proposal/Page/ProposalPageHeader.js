// @flow

import React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';
import type { Proposal } from '../../../redux/modules/proposal';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';
import type { State } from '../../../types';

type Props = {
  proposal: Proposal,
  className: string,
  referer: ?string,
};

export class ProposalPageHeader extends React.Component<Props> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { proposal, className, referer } = this.props;

    const createdDate = (
      <FormattedDate
        value={moment(proposal.createdAt)}
        day="numeric"
        month="long"
        year="numeric"
        hour="numeric"
        minute="numeric"
      />
    );
    const updatedDate = (
      <FormattedDate
        value={moment(proposal.updatedAt)}
        day="numeric"
        month="long"
        year="numeric"
        hour="numeric"
        minute="numeric"
      />
    );

    const classes = {
      proposal__header: true,
      [className]: true,
    };

    return (
      <div className={classNames(classes)}>
        <div>
          <a style={{ textDecoration: 'none' }} href={referer || proposal._links.index}>
            <i className="cap cap-arrow-65-1 icon--black" />{' '}
            {<FormattedMessage id="proposal.back" />}
          </a>
        </div>
        <h1 className="consultation__header__title h1">{proposal.title}</h1>
        <div className="media">
          <UserAvatar className="pull-left" user={proposal.author} />
          <div className="media-body">
            <p className="media--aligned excerpt">
              <FormattedMessage
                id="proposal.infos.header"
                values={{
                  user: <UserLink user={proposal.author} />,
                  createdDate,
                }}
              />
              {moment(proposal.updatedAt).diff(proposal.createdAt, 'seconds') > 1 && (
                <span>
                  {' • '}
                  <FormattedMessage
                    id="global.edited_on"
                    values={{
                      updated: updatedDate,
                    }}
                  />
                </span>
              )}
            </p>
          </div>
          {!proposal.isDraft && (
            <ProposalVoteButtonWrapper
              proposal={proposal}
              className="btn-lg"
              id={`proposal-vote-btn-${proposal.id}`}
            />
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    referer: state.proposal.referer || null,
  };
};

export default connect(mapStateToProps)(ProposalPageHeader);
