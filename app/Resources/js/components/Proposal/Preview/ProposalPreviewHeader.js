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
      <span className={classes}>
        <UserAvatar user={proposal.author} className="pull-left" />
        <div className="opinion__data">
          <UserLink user={proposal.author} />
        </div>
      </span>
    );
  },

});

export default ProposalPreviewHeader;
