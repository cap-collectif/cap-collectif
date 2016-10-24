import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
// import { submitProposal } from '../../../redux/modules/proposal';
import { Field, reduxForm } from 'redux-form';

const formName = 'proposal-fusion';
const renderField = ({ input, label, type, meta: { touched, error } }) => ( // eslint-disable-line
  <div>
    <label htmlFor>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type} />
      {touched && error && <span>{error}</span>}
    </div>
  </div>
);

const validate = () => true;
const handleSubmit = () => {};

const ProposalFusionForm = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    themes: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    return (
      <form id="proposal-fustion-form" onSubmit={handleSubmit}>
        <Field name="firstName" type="text" component={renderField} label="First Name" />
        <Field name="lastName" type="text" component={renderField} label="Last Name" />
      </form>
    );
  },
});

const mapStateToProps = (state) => ({
  features: state.default.features,
  themes: state.default.themes,
  districts: state.default.districts,
  categories: [],
  form: null,
});

export default connect(mapStateToProps)(
  reduxForm({
    form: formName,
    destroyOnUnmount: false,
    validate,
  })(ProposalFusionForm));
