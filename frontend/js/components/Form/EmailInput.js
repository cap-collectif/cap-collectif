// @flow
import * as React from 'react';
import mailcheck from 'mailcheck';
import { FormControl } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import domains from '../../utils/email_domains';

type Props = {
  value: ?any,
  onChange: (response: ?string) => void,
};

type State = {
  suggestion: ?string,
};

export class EmailInput extends React.Component<Props, State> {
  state = {
    suggestion: null,
  };

  componentDidUpdate(prevProps: Props) {
    const { value } = this.props;
    if (prevProps.value !== value) {
      this.checkMail();
    }
  }

  setSuggestion() {
    const { onChange } = this.props;
    const { suggestion } = this.state;
    onChange(suggestion);
  }

  checkMail() {
    const { value } = this.props;
    mailcheck.run({
      email: value,
      domains,
      suggested: suggestion => this.setState({ suggestion: suggestion.full }),
      empty: () => this.setState({ suggestion: null }),
    });
  }

  render() {
    const { suggestion } = this.state;
    return (
      <div>
        <FormControl type="email" {...this.props} />
        {suggestion && (
          <p className="registration__help">
            <FormattedMessage id="registration.email.suggestion" />{' '}
            <a
              href="#email-correction"
              onClick={() => {
                this.setSuggestion();
              }}
              className="js-email-correction">
              {suggestion}
            </a>{' '}
            ?
          </p>
        )}
      </div>
    );
  }
}

export default EmailInput;
