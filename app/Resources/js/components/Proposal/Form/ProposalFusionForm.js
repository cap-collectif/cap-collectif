// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import Fetcher from '../../../services/Fetcher';
import { renderSelect } from '../../Form/Select';
import type { State, Uuid } from '../../../types';

export const formName = 'proposal';
const validate = (values: Object): Object => {
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
    currentCollectStep: PropTypes.object,
    onProjectChange: PropTypes.func.isRequired,
  },

  render() {
    const { currentCollectStep, projects, onProjectChange } = this.props;
    return (
      <form className="form-horizontal">
        <Field
          name="project"
          id="project"
          label="Projet lié"
          placeholder="Sélectionnez un projet"
          isLoading={projects.length === 0}
          component={renderSelect}
          clearable={false}
          onChange={() => onProjectChange(formName, 'childConnections', [])}
          options={projects.map(p => ({ value: p.id, label: p.title }))}
        />
        <br />
        {currentCollectStep &&
          <Field
            name="childConnections"
            id="childConnections"
            multi
            label="Propositions"
            placeholder="Sélectionnez les propositions à fusionner"
            component={renderSelect}
            filterOptions={(options, filter, currentValues) =>
              options
                .filter(o => o.stepId === currentCollectStep.id) // If step has changed, we hide previous steps
                .filter(o => !currentValues.includes(o))}
            loadOptions={input =>
              Fetcher.postToJson(
                `/collect_steps/${currentCollectStep.id}/proposals/search`,
                { terms: input },
              ).then(res => ({
                options: res.proposals.map(p => ({
                  value: p.id,
                  label: p.title,
                  stepId: currentCollectStep.id,
                })),
              }))}
          />}
      </form>
    );
  },
});

const getBudgetProjects = (projects: { [id: Uuid]: Object }): Array<Object> => {
  return Object.keys(projects)
    .map(key => projects[key])
    .filter(p => p.steps.filter(s => s.type === 'collect').length > 0);
};

const getSelectedProjectId = (state: State): Uuid => {
  return formValueSelector(formName)(state, 'project');
};

const getCurrentCollectStep = (state: State): ?Object => {
  const id = getSelectedProjectId(state);
  if (!id) {
    return null;
  }
  const project = state.project.projectsById[id];
  if (!project) {
    return null;
  }
  return Object.keys(project.steps)
    .map(k => project.steps[k])
    .filter(s => s.type === 'collect')[0];
};

export default connect(
  state => ({
    projects: getBudgetProjects(state.project.projectsById),
    currentCollectStep: getCurrentCollectStep(state),
  }),
  { onProjectChange: change },
)(
  reduxForm({
    form: formName,
    destroyOnUnmount: false,
    validate,
  })(ProposalFusionForm),
);
