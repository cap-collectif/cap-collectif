import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';

const FlashMessages = React.createClass({
  propTypes: {
    errors: React.PropTypes.array,
    success: React.PropTypes.array,
    style: React.PropTypes.object,
    form: React.PropTypes.bool,
    onDismissMessage: React.PropTypes.func,
    translate: React.PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      errors: [],
      success: [],
      style: {},
      form: false,
      onDismissMessage: null,
      translate: true,
    };
  },

  renderText(message) {
    if (this.props.translate) {
      if (typeof message === 'string') {
        return this.getIntlMessage(message);
      }
      return (
        <FormattedMessage
          message={this.getIntlMessage(message.message)}
          {...message.params}
        />);
    }
    return message;
  },

  renderMessage(index, message, type) {
    if (!this.props.form) {
      return (
        <Alert
          key={index}
          bsStyle={type}
          style={this.props.style}
          onDismiss={this.props.onDismissMessage ? this.props.onDismissMessage.bind(null, message, type) : null}
        >
          <p>{this.renderText(message)}</p>
        </Alert>
      );
    }
    return (
      <p key={index} className="error-block" style={this.props.style}>
        {this.renderText(message)}
      </p>
    );
  },

  render() {
    if (this.props.errors.length > 0 || this.props.success.length > 0) {
      return (
        <div className="flashmessages">
          {
            this.props.errors.map((message, index) => {
              return this.renderMessage(index, message, 'warning');
            })
          }
          {
            this.props.success.map((message, index) => {
              return this.renderMessage(index, message, 'success');
            })
          }
        </div>
      );
    }
    return null;
  },

});

export default FlashMessages;
