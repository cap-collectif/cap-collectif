import UserAvatar from '../../User/UserAvatar';

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
      </span>
    );
  },

});

export default ProposalPreviewHeader;
