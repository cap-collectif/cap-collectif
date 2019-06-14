// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import Input from './Input';

type Props = {
  field: Object,
  onChange: Function,
  disabled?: boolean,
  value?: string,
};

type State = {
  value: string,
  checked: boolean,
};

class Other extends React.Component<Props, State> {
  state = {
    value: this.props.value || '',
    checked: !!this.props.value,
  };

  componentDidUpdate() {
    // $FlowFixMe
    const input = ReactDOM.findDOMNode(this.textField).getElementsByTagName('input')[0];
    if (input instanceof HTMLInputElement) {
      input.addEventListener(
        'blur',
        (event: FocusEvent) => {
          // $FlowFixMe
          if (event.target.value === '') {
            this.setState({
              checked: false,
            });
          }
        },
        true,
      );
    }
  }

  onType = (e: $FlowFixMe) => {
    const { onChange } = this.props;

    this.setState({
      value: e.target.value,
      checked: true,
    });

    onChange(e, e.target.value);
  };

  onCheckUncheck = (e: SyntheticInputEvent<>) => {
    // $FlowFixMe
    const input = ReactDOM.findDOMNode(this.textField).getElementsByTagName('input')[0];

    if (input instanceof HTMLInputElement) {
      if (e.target.checked) {
        input.focus();
        this.props.onChange(e, this.state.value);
      } else {
        input.value = '';
        this.setState({
          value: '',
        });
        this.props.onChange(e, undefined);
      }
    }
    this.setState({
      checked: e.target.checked,
    });
  };

  textField: ?React.Component<*> | mixed;

  clear = () => {
    this.setState({
      value: '',
      checked: false,
    });
    // $FlowFixMe
    const input = ReactDOM.findDOMNode(this.textField).getElementsByTagName('input')[0];
    if (input instanceof HTMLInputElement) {
      input.value = '';
    }
  };

  render() {
    const { disabled, field } = this.props;
    const { value } = this.state;

    const fieldName = `choices-for-field-${field.id}`;

    return (
      <div id={`reply-${field.id}_choice-other`} className="other-field">
        <div className="other-field__input">
          <Input
            id={`reply-${field.id}_choice-other--check`}
            name={fieldName}
            type={this.props.field.type}
            checked={this.state.checked}
            helpPrint={false}
            onChange={this.onCheckUncheck}
            disabled={disabled}>
            <FormattedMessage id="reply.other" />
          </Input>
        </div>
        <div className="other-field__value">
          <Input
            id={`reply-${field.id}_choice-other--field`}
            ref={c => {
              this.textField = c;
            }}
            type="text"
            onChange={this.onType}
            placeholder="reply.your_response"
            value={value}
            disabled={disabled}
          />
        </div>
      </div>
    );
  }
}

export default Other;
