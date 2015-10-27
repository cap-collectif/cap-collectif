const Alert = ReactBootstrap.Alert;

const FlashMessages = React.createClass({
  propTypes: {
    errors: React.PropTypes.array,
    success: React.PropTypes.array,
    style: React.PropTypes.object,
    form: React.PropTypes.bool,
    onDismissMessage: React.PropTypes.function,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      errors: [],
      success: [],
      style: {},
      form: false,
      onDismissMessage: null,
    };
  },

  dismissMessage(message, type) {
    this.props.onDismissMessage(message, type);
  },

  renderMessage(message, type) {
    if (!this.props.form) {
      return (
        <Alert
          bsStyle={type}
          style={this.props.style}
          onDismiss={this.dismissMessage.bind(null, message, type)}
        >
          <p>{this.getIntlMessage(message)}</p>
        </Alert>
      );
    }
    return (
      <span className="error-block" style={this.props.style}>
        {this.getIntlMessage(message)}
      </span>
    );
  },

  render() {
    if (this.props.errors.length > 0 || this.props.success.length > 0 ) {
      return (
        <div className="flashmessages">
          {
            this.props.errors.map((message) => {
              return this.renderMessage(message, 'warning');
            })
          }
          {
            this.props.success.map((message) => {
              return this.renderMessage(message, 'success');
            })
          }
        </div>
      );
    }
    return null;
  },

});

export default FlashMessages;
