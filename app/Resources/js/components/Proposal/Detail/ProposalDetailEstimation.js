const FormattedNumber = ReactIntl.FormattedNumber;

const ProposalPreviewEstimation = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const proposal = this.props.proposal;

    return proposal.estimation || proposal.estimation === 0
      ? <span>
          <i className="cap cap-clip-2-1"></i>
          <FormattedNumber value={proposal.estimation} style="currency" currency="EUR" />
        </span>
      : null
    ;
  },
});

export default ProposalPreviewEstimation;
