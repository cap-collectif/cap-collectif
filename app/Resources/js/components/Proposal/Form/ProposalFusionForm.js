import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { fetchProjects } from '../../../redux/modules/project';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import Input from '../../Form/Input';
import Select from 'react-select';
import Fetcher from '../../../services/Fetcher';

const formName = 'proposal';

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

const renderSelect = ({ name, label, input }) => { // eslint-disable-line
  if (typeof input.loadOptions === 'function') {
    return <Select.Async {...input} name={name} label={label} onBlur={() => { input.onBlur(input.value); }} />;
  }
  return <Select {...input} name={name} label={label} onBlur={() => { input.onBlur(input.value); }} />;
};

const validate = (values) => {
  console.log(values);
};
const handleSubmit = () => {};

let ProposalFusionForm = React.createClass({
  propTypes: {
    proposalForm: PropTypes.object,
    projects: PropTypes.array.isRequired,
    proposals: PropTypes.array.isRequired,
    onMount: PropTypes.func.isRequired,
    currentCollectStep: PropTypes.object,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    this.props.onMount();
  },

  render() {
    const { currentCollectStep, projects } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="project"
          label="Projet lié"
          placeholder="Sélectionnez un projet"
          isLoading={projects.length === 0}
          component={renderSelect}
          options={projects.map(project => ({ value: project.id, label: project.title }))}
        />
        <br />
        {
          currentCollectStep &&
            <Field
              name="parents"
              multi
              label="Propositions"
              placeholder="Sélectionnez les propositions à fusionner"
              component={renderSelect}
              loadOptions={input => Fetcher
                .postToJson(`/collect_steps/${currentCollectStep.id}/proposals/search`, { terms: input })
                .then(res => ({ options: res.proposals.map(p => ({ value: p.id, label: p.title })) }))
              }
            />
       }
      </form>
    );
  },
});

ProposalFusionForm = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  validate,
})(ProposalFusionForm);

ProposalFusionForm = connect(state => {
  const projects = state.project.projects.filter(project => project.steps.filter(step => step.type === 'collect').length > 0);
  const selectedProject = parseInt(formValueSelector(formName)(state, 'project'), 10);
  return {
    projects,
    currentCollectStep: selectedProject ? projects.find(p => p.id === selectedProject).steps.filter(step => step.type === 'collect')[0] : null,
  };
}, { onMount: fetchProjects })(ProposalFusionForm);

export default ProposalFusionForm;
