import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import Input from './Input';
import { Row, Col } from 'react-bootstrap';

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
    this.textField.refs.input.addEventListener('blur', (event) => {
      if (event.target.value === '') {
        this.setState({
          checked: false,
        });
      }
    }, true);
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
    if (e.target.checked) {
      this.textField.refs.input.focus();
    } else {
      this.textField.refs.input.value = '';
      this.setState({
        value: '',
      });
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
    this.textField.refs.input.value = '';
  },

  render() {
    const { disabled } = this.props;
    const field = this.props.field;
    const fieldName = `choices-for-field-${field.id}`;

    return (
      <Row id={`reply-${field.id}_choice-other`} className="checkbox--other">
        <Col xs={2} md={1}>
          <Input
            id={`reply-${field.id}_choice-other--check`}
            name={fieldName}
            type={this.props.field.type}
            label={this.getIntlMessage('reply.other')}
            checked={this.state.checked}
            onChange={this.onCheckUncheck}
            disabled={disabled}
          />
        </Col>
        <Col xs={10} md={11}>
          <Input
            id={`reply-${field.id}_choice-other--field`}
            ref={c => this.textField = c}
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
