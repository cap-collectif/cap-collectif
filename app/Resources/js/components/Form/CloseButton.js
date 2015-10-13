const Button = ReactBootstrap.Button;

const CloseButton = React.createClass({
  propTypes: {
    onClose: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <Button onClick={this.props.onClose}>
        { this.getIntlMessage('global.cancel') }
      </Button>
    );
  }

});

export default CloseButton;





