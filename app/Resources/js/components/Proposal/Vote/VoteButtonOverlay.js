const OverlayTrigger = ReactBootstrap.OverlayTrigger;
const Tooltip = ReactBootstrap.Tooltip;

const VoteButtonOverlay = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    show: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  // We add tooltip if user has not enough credits
  render() {
    if (!this.props.show) {
      return this.props.children;
    }

    return (
      <OverlayTrigger placement="top" overlay={
        <Tooltip placement="top" className="in">
          { this.getIntlMessage('proposal.vote.not_enough_credits') }
        </Tooltip>}
      >
        { this.props.children }
      </OverlayTrigger>
    );
  },

});

export default VoteButtonOverlay;
