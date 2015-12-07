const FormattedNumber = ReactIntl.FormattedNumber;

const ProposalPreviewEstimation = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  defaultProps: {
      className: '',
      style : {},
  },

  render() {
    const className = this.props.className;
    const style = this.props.style;
    const proposal = this.props.proposal;

    return (
      <div className={className} style={style}>
        <i className="cap cap-clip-2-1"></i>
        <FormattedNumber value={proposal.estimation} style="currency" currency="EUR" />
      </div>
    );
  }
});

export default ProposalPreviewEstimation;
