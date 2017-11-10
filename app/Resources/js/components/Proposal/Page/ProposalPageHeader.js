import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';

export const ProposalPageHeader = React.createClass({
  displayName: 'ProposalPageHeader',

  propTypes: {
    proposal: PropTypes.object.isRequired,
    className: PropTypes.string,
    referer: PropTypes.string.isRequired,
  },

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const { proposal, className, referer } = this.props;

    const createdDate = (
      <FormattedDate
        value={moment(proposal.created_at)}
        day="numeric"
        month="long"
        year="numeric"
        hour="numeric"
        minute="numeric"
      />
    );
    const updatedDate = (
      <FormattedDate
        value={moment(proposal.updated_at)}
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
        <ProposalVoteButtonWrapper
          id="proposal-vote-btn"
          proposal={proposal}
          className="pull-right btn-lg"
        />
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
              {moment(proposal.updated_at).diff(proposal.created_at, 'seconds') > 1 && (
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
        </div>
      </div>
    );
  },
});

const mapStateToProps = state => {
  return {
    referer: state.proposal.referer,
  };
};

export default connect(mapStateToProps)(ProposalPageHeader);
