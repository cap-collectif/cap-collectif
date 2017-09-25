import React, { PropTypes } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const Captcha = React.createClass({
  propTypes: {
    value: PropTypes.any,
    onChange: PropTypes.func.isRequired,
  },

  render() {
    const { onChange } = this.props;
    return (
      <ReCAPTCHA
        ref={c => (this.captcha = c)}
        style={{ transform: 'scale(0.85)', transformOrigin: '0 0' }}
        sitekey="6LctYxsTAAAAANsAl06GxNeV5xGaPjy5jbDe-J8M"
        onChange={onChange}
      />
    );
  },
});

export default Captcha;
