import React from 'react';
import {IntlMixin, FormattedMessage, FormattedDate} from 'react-intl';
import {Label} from 'react-bootstrap';
import classNames from 'classnames';
import moment from 'moment';
import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';
import ProposalDetailEstimation from '../Detail/ProposalDetailEstimation';

const ProposalPageHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const proposal = this.props.proposal;
    const votesCount = proposal.votesCount;

    const createdDate = (
      <FormattedDate
       value={moment(proposal.created_at)}
       day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"
      />
    );
    const updatedDate = (
      <FormattedDate
        value={moment(proposal.updated_at)}
        day="numeric" month="long" year="numeric" hour="numeric" minute="numeric"
      />
    );

    const classes = {
      'proposal__header': true,
    };
    classes[this.props.className] = true;

    return (
      <div className={classNames(classes)}>
        <h1 className="consultation__header__title h1">{proposal.title}</h1>
        <div className="media">
          <UserAvatar className="pull-left" user={proposal.author} />
          <div className="media-body">
            <p className="media--aligned excerpt">
              <FormattedMessage
                message={this.getIntlMessage('proposal.infos.header')}
                user={<UserLink user={proposal.author} />}
                theme={proposal.theme ? 'yes' : 'no'}
                themeLink={
                  <a href={proposal.theme._links.show}>
                    {proposal.theme.title}
                  </a>
                }
                createdDate={createdDate}
              />
              {
                (moment(proposal.updated_at).diff(proposal.created_at, 'seconds') > 1)
                ? <span>
                    {' • '}
                    <FormattedMessage
                      message={this.getIntlMessage('global.edited_on')}
                      updated={updatedDate}
                    />
                  </span>
                : null
              }
            </p>
          </div>
        </div>
        <ul className="nav nav-pills project__infos">
          { proposal.votesCount > 0
            ? <li className="proposal__info--votes">
                <div className="value">{votesCount}</div>
                <div className="excerpt category">
                  <FormattedMessage
                    message={this.getIntlMessage('vote.count_no_nb')}
                    count={votesCount}
                  />
                </div>
              </li>
            : null
          }
          <li className="proposal__info--comments">
            <div className="value">{proposal.comments_count}</div>
            <div className="excerpt category">
              <FormattedMessage
                message={this.getIntlMessage('comment.count_no_nb')}
                count={proposal.comments_count}
              />
            </div>
          </li>
          {proposal.status
            ? <li style={{fontSize: 26, paddingTop: 5}}>
                <Label bsSize="large" bsStyle={proposal.status.color}>{proposal.status.name}</Label>
              </li>
            : null
          }
        </ul>
        <div className="proposal__infos">
          <span className="proposal__info">
            <i className="cap cap-marker-1-1"></i>{proposal.district.name}
          </span>
          <span className="proposal__info">
            <ProposalDetailEstimation proposal={proposal} />
          </span>
        </div>
      </div>
    );
  },

});

export default ProposalPageHeader;
