import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

const FormattedDate = ReactIntl.FormattedDate;
const FormattedMessage = ReactIntl.FormattedMessage;

const ProposalPreviewHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    const updatedDate = (
      <FormattedDate
        value={moment(proposal.updated_at)}
        day="numeric" month="long" year="numeric"
      />
    );

    return (
      <div>
        <UserAvatar user={proposal.author} className="pull-left proposal__avatar" />
        <div className="proposal__author">
          <UserLink user={proposal.author} />
          <p className="excerpt small proposal__date" >
            <FormattedDate
              value={moment(proposal.created_at)}
              day="numeric" month="long" year="numeric"
            />
          </p>
          {
            (moment(proposal.updated_at).diff(proposal.created_at, 'seconds') > 1)
              ? <p className="excerpt small proposal__date">
                <FormattedMessage
                  message={this.getIntlMessage('global.edited_on')}
                  updated={updatedDate}
                />
              </p>
              : null
          }
        </div>
      </div>
    );
  },

});

export default ProposalPreviewHeader;
