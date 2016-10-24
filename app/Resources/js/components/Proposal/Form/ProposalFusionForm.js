import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { fetchProjects } from '../../../redux/modules/project';
import { Field, reduxForm } from 'redux-form';
import Input from '../../Form/Input';

const formName = 'proposal-fusion';
const renderField = ({error, touched, input: { placeholder, type, autoFocus, label, name, labelClassName }}) => { // eslint-disable-line
  return (<Input
    type={type}
    name={name}
    labelClassName={labelClassName || ''}
    label={label || null}
    placeholder={placeholder || null}
    // errors={(touched && error) ? this.getIntlMessage(error) : null}
    bsStyle={touched ? (error ? 'error' : 'success') : null}
    hasFeedback={touched}
  />);
};

const validate = (values) => {
  console.log(values);
};
const handleSubmit = () => {};

const ProposalFusionForm = React.createClass({
  propTypes: {
    proposalForm: PropTypes.object,
    projects: PropTypes.array.isRequired,
    proposals: PropTypes.array.isRequired,
    themes: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    onMount: PropTypes.func.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    this.props.onMount();
  },

  render() {
    const { projects } = this.props;
    return (
      <form id="proposal-fustion-form" onSubmit={handleSubmit}>
        <Field name="project" component="select" label="Mon Project" autoFocus>
            <option>Sélectionner un projet</option>
            {
              projects.map(project => <option value={project.id}>{project.title}</option>)
            }
        </Field>
      </form>
    );
  },
});

const mapStateToProps = (state) => ({
  features: state.default.features,
  themes: state.default.themes,
  districts: state.default.districts,
  projects: state.project.projects,
  categories: [],
  proposals: [],
  proposalForm: null,
});

export default connect(mapStateToProps)({ onMount: fetchProjects })(
  reduxForm({
    form: formName,
    destroyOnUnmount: false,
    validate,
  })(ProposalFusionForm));
