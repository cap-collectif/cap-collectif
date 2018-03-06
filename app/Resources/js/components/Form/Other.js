// @flow
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Input from './Input';

const Other = React.createClass({
  propTypes: {
    field: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    isReduxForm: PropTypes.bool,
    value: PropTypes.string
  },

  getDefaultProps() {
    return {
      isReduxForm: false
    };
  },

  getInitialState() {
    return {
      value: this.props.value || '',
      checked: !!this.props.value
    };
  },

  componentDidUpdate() {
    // $FlowFixMe
    const input = ReactDOM.findDOMNode(this.textField).getElementsByTagName('input')[0];
    if (input instanceof HTMLInputElement) {
      input.addEventListener(
        'blur',
        (event: FocusEvent) => {
          if (event.target.value === '') {
            this.setState({
              checked: false
            });
          }
        },
        true
      );
    }
  },

  onType(e) {
    const { onChange } = this.props;

    this.setState({
      value: e.target.value,
      checked: true
    });

    onChange(e, e.target.value);
  },

  onCheckUncheck(e) {
    // $FlowFixMe
    const input = ReactDOM.findDOMNode(this.textField).getElementsByTagName('input')[0];

    if (input instanceof HTMLInputElement) {
      if (e.target.checked) {
        input.focus();
        if (this.props.isReduxForm) {
          this.props.onChange(e, this.state.value);
        }
      } else {
        input.value = '';
        this.setState({
          value: ''
        });
        if (this.props.isReduxForm) {
          this.props.onChange(e, undefined);
        }
      }
    }
    this.setState({
      checked: e.target.checked
    });
  },

  clear() {
    this.setState({
      value: '',
      checked: false
    });
    // $FlowFixMe
    const input = ReactDOM.findDOMNode(this.textField).getElementsByTagName('input')[0];
    if (input instanceof HTMLInputElement) {
      input.value = '';
    }
  },

  render() {
    const { disabled, field } = this.props;
    const { value } = this.state;

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
            {<FormattedMessage id="reply.other" />}
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
            placeholder="reply.your_response"
            value={value}
            disabled={disabled}
          />
        </Col>
      </Row>
    );
  }
});

export default Other;
