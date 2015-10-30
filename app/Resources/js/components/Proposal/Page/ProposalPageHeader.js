import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

const FormattedDate = ReactIntl.FormattedDate;

const ProposalPageHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    return (
      <div className="container--custom container--with-sidebar">
        <h1 className="consultation__header__title h1">{proposal.title}</h1>
        <div className="media">
          <UserAvatar user={proposal.author} />
          <div className="media-body">
            <p className="media--aligned excerpt">
              <UserLink user={proposal.author} /> dans <a href="/themes/environnement">Environnement</a>, le
              { ' ' }
              <FormattedDate
                value={moment(proposal.created_at)}
                day="numeric" month="long" year="numeric"
              />
            </p>
          </div>
        </div>
        <ul className="nav nav-pills consultation__infos">
          <li>
            <div className="value">{proposal.votes_count}</div>
            <div className="excerpt category">votes</div>
          </li>
          <li>
            <div className="value">{proposal.comments_count}</div>
            <div className="excerpt category">commentaires</div>
          </li>
        </ul>
      </div>
    );
  },

});

export default ProposalPageHeader;
