const FormattedNumber = ReactIntl.FormattedNumber;

const ProposalPreviewEstimation = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;
    if (!proposal.estimation) {
      return null;
    }
    return (
      <span>
        <i className="cap cap-clip-2-1"></i>
        <FormattedNumber value={proposal.estimation} style="currency" currency="EUR" />
      </span>
    );
  },
});

export default ProposalPreviewEstimation;
