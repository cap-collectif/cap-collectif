import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field as ReduxFormField, formValueSelector } from 'redux-form';
import Field from '../../Form/Field';

let OpinionLinkSelectTypeForm = React.createClass({
  propTypes: {
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.any,
  },
  mixins: [IntlMixin],

  componentDidUpdate(prevProps) {
    if (prevProps && prevProps.type && prevProps.type !== this.props.type) {
      this.props.onChange(parseInt(this.props.type, 10));
    }
  },

  render() {
    const { options } = this.props;
    return (
      <form id="opinion-link-select-type-form">
        <ReduxFormField
          autoFocus
          label={'Type'}
          name={'type'}
          type={'select'}
          component={Field}
        >
          <option disabled>{this.getIntlMessage('global.select')}</option>
          {
            options.map((opt, i) => <option key={i} value={opt.id}>{opt.title}</option>)
          }
      </ReduxFormField>
      </form>
    );
  },

});

const selector = formValueSelector('OpinionLinkSelectTypeForm');
OpinionLinkSelectTypeForm = connect(
  state => {
    return {
      type: selector(state, 'type'),
    };
  })(OpinionLinkSelectTypeForm);


export default reduxForm({
  form: 'OpinionLinkSelectTypeForm',
})(OpinionLinkSelectTypeForm);
