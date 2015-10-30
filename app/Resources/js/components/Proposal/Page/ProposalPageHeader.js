import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

const FormattedDate = ReactIntl.FormattedDate;
const FormattedMessage = ReactIntl.FormattedMessage;
const Label = ReactBootstrap.Label;

const ProposalPageHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    const createdDate = (
      <FormattedDate
       value={moment(proposal.created_at)}
       day="numeric" month="long" year="numeric"
      />
    );
    return (
      <div className="container--custom container--with-sidebar">
        <h1 className="consultation__header__title h1">{proposal.title}</h1>
        <div className="media">
          <UserAvatar user={proposal.author} />
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
          <li>
            <Label bsStyle={proposal.status.color}>{proposal.status.name}</Label>
            {proposal.district.name}
          </li>
        </ul>
      </div>
    );
  },

});

export default ProposalPageHeader;
