import CommentSection from '../../Comment/CommentSection';

const ProposalPageComments = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="container--custom container--with-sidebar">
        <CommentSection uri="proposals" object={this.props.proposal.id} />
      </div>
    );
  },

});

export default ProposalPageComments;
