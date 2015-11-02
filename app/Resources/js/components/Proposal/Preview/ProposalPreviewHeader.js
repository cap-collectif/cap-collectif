import UserAvatar from '../../User/UserAvatar';
import UserLink from '../../User/UserLink';

const ProposalPreviewHeader = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    const classes = classNames({});

    return (
      <div className={classes}>
        <UserAvatar user={proposal.author} style={{marginRight: 10}} className="pull-left" />
        <div className="opinion__data" className="proposal__author">
          <UserLink user={proposal.author} />
        </div>
      </div>
    );
  },

});

export default ProposalPreviewHeader;
