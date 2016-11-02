import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { fetchProjects } from '../../../redux/modules/project';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import Fetcher from '../../../services/Fetcher';
import { renderSelect } from '../../Form/Select';

const formName = 'proposal';
const validate = (values) => {
  console.log(values);
};

export const ProposalFusionForm = React.createClass({
  propTypes: {
    proposalForm: PropTypes.object,
    projects: PropTypes.array.isRequired,
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
      <form className="form-horizontal">
        <Field
          name="project"
          label="Projet lié"
          placeholder="Sélectionnez un projet"
          isLoading={projects.length === 0}
          autofocus
          component={renderSelect}
          clearable={false}
          options={projects.map(project => ({ value: project.id, label: project.title }))}
        />
        <br />
        {
          currentCollectStep &&
            <Field
              name="childConnections"
              multi
              label="Propositions"
              placeholder="Sélectionnez les propositions à fusionner"
              component={renderSelect}
              filterOptions={(options, filter, currentValues) => options
                .filter(o => o.stepId === currentCollectStep.id) // If step has changed, we hide previous steps
                .filter(o => !currentValues.includes(o))
              }
              loadOptions={input => Fetcher
                .postToJson(`/collect_steps/${currentCollectStep.id}/proposals/search`, { terms: input })
                .then(res => ({ options: res.proposals.map(p => ({ value: p.id, label: p.title, stepId: currentCollectStep.id })) }))
              }
            />
       }
      </form>
    );
  },
});

export default connect(state => {
  const projects = state.project.projects.filter(p => p.steps.filter(s => s.type === 'collect').length > 0);
  const selectedProject = parseInt(formValueSelector(formName)(state, 'project'), 10);
  return {
    projects,
    currentCollectStep: selectedProject
      ? projects.find(p => p.id === selectedProject).steps.filter(s => s.type === 'collect')[0]
      : null,
  };
}, { onMount: fetchProjects })(reduxForm({
  form: formName,
  destroyOnUnmount: false,
  validate,
})(ProposalFusionForm));
