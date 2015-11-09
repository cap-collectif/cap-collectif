import CommentSection from '../../Comment/CommentSection';

const ProposalPageComments = React.createClass({
  propTypes: {
    id: React.PropTypes.number.isRequired,
    form: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="container--custom container--with-sidebar">
        <CommentSection
          uri={`proposal_forms/${this.props.form.id}/proposals`}
          object={this.props.id}
        />
      </div>
    );
  },

});

export default ProposalPageComments;
