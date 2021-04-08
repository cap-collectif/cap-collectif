// @flow
import * as React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import config from '~/config';

/**
 * Allow Google ReCaptcha to work in test mode
 * see https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
 */
const CAPTCHA_TEST_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
const CAPTCHA_PROD_KEY = '6LfKLxsTAAAAANGSsNIlspDarsFFK53b4bKiBYKC';

type Props = {
  onChange: (response: string) => void,
  style?: Object,
  value: ?string,
};

export class Captcha extends React.PureComponent<Props> {
  captcha: ?Object;

  componentDidUpdate(prevProps: Props) {
    const { value } = this.props;
    if (
      prevProps &&
      prevProps.value !== null &&
      !value &&
      typeof window.grecaptcha !== 'undefined'
    ) {
      window.grecaptcha.reset();
    }
  }

  render() {
    const { onChange, style } = this.props;

    return (
      <ReCAPTCHA
        id="recaptcha"
        ref={c => {
          this.captcha = c;
        }}
        style={{ transform: 'scale(0.85)', transformOrigin: '0 0', ...style }}
        sitekey={config.isTest ? CAPTCHA_TEST_KEY : CAPTCHA_PROD_KEY}
        onChange={onChange}
      />
    );
  }
}

export default Captcha;
