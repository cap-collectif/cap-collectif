// @flow
import React, { PropTypes } from 'react';
import mailcheck from 'mailcheck';
import { FormControl } from 'react-bootstrap';
import domains from '../../utils/email_domains';

const EmailInput = React.createClass({
  propTypes: {
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
  },

  getInitialState() {
    return { suggestion: null };
  },

  componentDidUpdate(prevProps) {
    const { value } = this.props;
    if (prevProps.value !== value) {
      this.checkMail();
    }
  },

  setSuggestion() {
    const { onChange } = this.props;
    onChange(this.state.suggestion);
  },

  checkMail() {
    const { value } = this.props;
    mailcheck.run({
      email: value,
      domains,
      suggested: suggestion => this.setState({ suggestion: suggestion.full }),
      empty: () => this.setState({ suggestion: null }),
    });
  },

  render() {
    // const { onChange } = this.props;
    const { suggestion } = this.state;
    return (
      <div>
        <FormControl type="email" {...this.props} />
        {suggestion && (
          <p className="registration__help">
            Vouliez vous dire{' '}
            <a
              href={'#email-correction'}
              onClick={() => {
                this.setSuggestion();
              }}
              className="js-email-correction">
              {this.state.suggestion}
            </a>{' '}
            ?
          </p>
        )}
      </div>
    );
  },
});

export default EmailInput;
