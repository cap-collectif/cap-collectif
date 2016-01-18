const Button = ReactBootstrap.Button;

const RegisterButton = React.createClass({
  propTypes: {
    style: React.PropTypes.object,
    bsStyle: React.PropTypes.string,
    label: React.PropTypes.string,
    className: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      label: 'global.register',
      style: {},
      className: '',
      bsStyle: 'link',
    };
  },

  render() {
    return (
      <Button
        href="/register"
        bsStyle={this.props.bsStyle}
        className={this.props.className}
        style={this.props.style}
      >
        {this.getIntlMessage(this.props.label)}
      </Button>
    );
  },

});

export default RegisterButton;
