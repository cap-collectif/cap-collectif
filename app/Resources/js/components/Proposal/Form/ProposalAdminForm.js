import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import Select from 'react-select';
// import Fetcher from '../../../services/Fetcher';

const formName = 'proposal';

const renderSelect = ({ name, label, input }) => { // eslint-disable-line
  // noResultsText
  if (typeof input.loadOptions === 'function') {
    return <Select.Async {...input} name={name} label={label} onBlur={() => { input.onBlur(input.value); }} />;
  }
  return <Select {...input} name={name} label={label} onBlur={() => { input.onBlur(input.value); }} />;
};

const validate = (values) => {
  console.log(values);
};
const handleSubmit = () => {};

let ProposalAdminForm = React.createClass({
  propTypes: {
    // proposalForm: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { user, proposalForm } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="author"
          label="Auteur"
          options={[{ label: user.displayName, value: user.id }, { label: 'lol', value: 899 }]}
          component={renderSelect}
          clearable={false}
          autoload={false}
          loadOptions={() => Promise.resolve({ options: [{ label: user.displayName, value: user.id }, { label: 'lol', value: 899 }] })}
        />
      </form>
    );
  },
});

ProposalAdminForm = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  validate,
})(ProposalAdminForm);

ProposalAdminForm = connect(state => ({
  initialValues: { author: state.default.user.id },
  user: state.default.user,
}))(ProposalAdminForm);
export default ProposalAdminForm;
