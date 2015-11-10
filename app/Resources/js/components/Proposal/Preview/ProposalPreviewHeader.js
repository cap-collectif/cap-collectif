import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

const FormattedDate = ReactIntl.FormattedDate;

const ProposalPreviewHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;

    return (
      <div>
        <UserAvatar user={proposal.author} className="pull-left proposal__avatar" />
        <div className="proposal__author">
          <UserLink user={proposal.author} />
          <p className="excerpt small">
            <FormattedDate
              value={moment(proposal.created_at)}
              day="numeric" month="long" year="numeric"
            />
            {
              proposal.created_at !== proposal.updated_at
              ? <span className="excerpt">
                  { ' - ' }
                  { this.getIntlMessage('global.edited') }
                  { ' ' }
                  <FormattedDate
                    value={moment(proposal.updated_at)}
                    day="numeric" month="long" year="numeric"
                    hour="numeric" minute="numeric"
                  />
                </span>
              : null
            }
          </p>
        </div>
      </div>
    );
  },

});

export default ProposalPreviewHeader;
