// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { fetchProjects } from '../../../redux/modules/project';
import Fetcher from '../../../services/Fetcher';
import { renderSelect } from '../../Form/Select';

const formName = 'proposal';
const validate = (values) => {
  const errors = {};
  if (values.childConnections && values.childConnections.length < 2) {
    errors.childConnections = 'Sélectionnez au moins 2 propositions.';
  }
  return errors;
};

export const ProposalFusionForm = React.createClass({
  propTypes: {
    proposalForm: PropTypes.object,
    projects: PropTypes.array.isRequired,
    onMount: PropTypes.func.isRequired,
    currentCollectStep: PropTypes.object,
    onProjectChange: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    this.props.onMount();
  },

  render() {
    const { currentCollectStep, projects, onProjectChange } = this.props;
    return (
      <form className="form-horizontal">
        <Field
          name="project"
          label="Projet lié"
          placeholder="Sélectionnez un projet"
          isLoading={projects.length === 0}
          component={renderSelect}
          clearable={false}
          onChange={() => onProjectChange(formName, 'childConnections', [])}
          options={projects.map(p => ({ value: p.id, label: p.title }))}
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

const getBudgetProjects = (projects: Array<Object>): Array<Object> => {
  return projects.filter(p => p.steps.filter(s => s.type === 'collect').length > 0);
};

const getSelectedProjectId = (state): string => {
  return formValueSelector(formName)(state, 'project');
};

const getCurrentCollectStep = (state): ?Object => {
  const selectedProject = getSelectedProjectId(state);
  if (!selectedProject) {
    return null;
  }
  const project = getBudgetProjects(state.project.projects).find(p => p.id === selectedProject);
  if (!project) {
    return null;
  }
  return project.steps.filter(s => s.type === 'collect')[0];
};

export default connect(state =>
  ({
    projects: getBudgetProjects(state.project.projects),
    currentCollectStep: getCurrentCollectStep(state),
  }),
   { onMount: fetchProjects, onProjectChange: change },
)(reduxForm({
  form: formName,
  destroyOnUnmount: false,
  validate,
})(ProposalFusionForm));
