// @flow
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { IntlMixin } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Input from './Input';

const Other = React.createClass({
  propTypes: {
    field: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      value: '',
      checked: false,
    };
  },

  componentDidUpdate() {
    const input = ReactDOM.findDOMNode(this.textField.refFormControl);
    if (input instanceof HTMLInputElement) {
      input.addEventListener(
        'blur',
        (event: FocusEvent) => {
          if (event.target.value === '') {
            this.setState({
              checked: false,
            });
          }
        },
        true,
      );
    }
  },

  onType(e) {
    const { onChange } = this.props;
    this.setState({
      value: e.target.value,
      checked: true,
    });
    onChange(e, this.state.value);
  },

  onCheckUncheck(e) {
    const input = ReactDOM.findDOMNode(this.textField.refFormControl);
    if (input instanceof HTMLInputElement) {
      if (e.target.checked) {
        input.focus();
      } else {
        input.value = '';
        this.setState({
          value: '',
        });
      }
    }
    this.setState({
      checked: e.target.checked,
    });
  },

  clear() {
    this.setState({
      value: '',
      checked: false,
    });
    const input = ReactDOM.findDOMNode(this.textField.refFormControl);
    if (input instanceof HTMLInputElement) {
      input.value = '';
    }
  },

  render() {
    const { disabled, field } = this.props;
    const fieldName = `choices-for-field-${field.id}`;

    return (
      <Row id={`reply-${field.id}_choice-other`} className="checkbox--other">
        <Col xs={2} md={1}>
          <Input
            id={`reply-${field.id}_choice-other--check`}
            name={fieldName}
            type={this.props.field.type}
            checked={this.state.checked}
            onChange={this.onCheckUncheck}
            disabled={disabled}>
            {this.getIntlMessage('reply.other')}
          </Input>
        </Col>
        <Col xs={10} md={11}>
          <Input
            id={`reply-${field.id}_choice-other--field`}
            // $FlowFixMe
            ref={c => (this.textField = c)}
            type="text"
            bsSize="small"
            onChange={this.onType}
            placeholder={this.getIntlMessage('reply.your_response')}
            disabled={disabled}
          />
        </Col>
      </Row>
    );
  },
});

export default Other;
