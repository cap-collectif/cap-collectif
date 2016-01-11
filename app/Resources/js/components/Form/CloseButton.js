const Button = ReactBootstrap.Button;

const CloseButton = React.createClass({
  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    label: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      label: 'global.cancel',
    };
  },

  render() {
    return (
      <Button onClick={this.props.onClose}>
        { this.getIntlMessage(this.props.label) }
      </Button>
    );
  },

});

export default CloseButton;
