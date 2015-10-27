import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

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
              <UserLink user={proposal.author} /> dans <a href="/themes/environnement">Environnement</a>, le 23 octobre 2015
            </p>
          </div>
        </div>
        <ul className="nav nav-pills consultation__infos">
          <li>
            <div className="value">{proposal.votesCount || 0}</div>
            <div className="excerpt category">votes</div>
          </li>
          <li>
            <div className="value">{proposal.commentsCount || 0}</div>
            <div className="excerpt category">comments</div>
          </li>
        </ul>
      </div>
    );
  },

});

export default ProposalPageHeader;
