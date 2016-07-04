import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field as ReduxFormField, formValueSelector } from 'redux-form';
import Field from '../../Form/Field';

export const OpinionLinkSelectTypeForm = React.createClass({
  propTypes: {
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    opinionType: PropTypes.any,
  },
  mixins: [IntlMixin],

  componentDidUpdate(prevProps) {
    if (prevProps && prevProps.opinionType && prevProps.opinionType !== this.props.opinionType) {
      this.props.onChange(parseInt(this.props.opinionType, 10));
    }
  },

  render() {
    const { options } = this.props;
    return (
      <form>
        <ReduxFormField
          autoFocus
          label={'Type'}
          name={'opinionType'}
          type={'select'}
          component={Field}
          disableValidation
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

function mapStateToProps(state) {
  return {
    opinionType: formValueSelector('OpinionLinkSelectTypeForm')(state, 'opinionType'),
  };
}
export default reduxForm({ form: 'OpinionLinkSelectTypeForm' })(connect(mapStateToProps)(OpinionLinkSelectTypeForm));
