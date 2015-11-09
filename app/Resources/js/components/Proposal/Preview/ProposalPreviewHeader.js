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
          </p>
        </div>
      </div>
    );
  },

});

export default ProposalPreviewHeader;
