// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Field, SubmissionError, reduxForm, formValueSelector, change } from 'redux-form';
import Fetcher from '../../../services/Fetcher';
import select from '../../Form/Select';
import CreateProposalFusionMutation, {
  type CreateProposalFusionMutationResponse,
} from '../../../mutations/CreateProposalFusionMutation';
import type { State, Uuid } from '../../../types';

export const formName = 'proposal';

type FormValues = {
  project: ?Uuid,
  fromProposals: $ReadOnlyArray<Uuid>,
};

const validate = (values: FormValues) => {
  const errors = {};
  if (!values.project) {
    errors.project = 'Veuillez sélectionner un projet';
  }
  if (!values.fromProposals || values.fromProposals.length < 2) {
    errors.childConnections = 'Veuillez sélectionner au minimum 2 propositions';
  }
  return errors;
};

const onSubmit = (values: FormValues) => {
  return CreateProposalFusionMutation.commit({
    input: { fromProposals: values.fromProposals },
  })
    .then((response: CreateProposalFusionMutationResponse) => {
      if (!response.createFusion || !response.createFusion.proposal) {
        throw new Error('Mutation "createFusion" failed.');
      }
      const createdProposal = response.createFusion.proposal;
      window.location.href = createdProposal.show_url;
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

type Props = {
  proposalForm: Object,
  projects: Array<Object>,
  currentCollectStep: Object,
  onProjectChange: (form: string, field: string, value: any) => void,
};

export class ProposalFusionForm extends React.Component<Props> {
  render() {
    const { currentCollectStep, projects, onProjectChange } = this.props;
    return (
      <form>
        <Field
          name="project"
          id="project"
          label="Projet participatif"
          placeholder="Sélectionner le projet participatif"
          isLoading={projects.length === 0}
          component={select}
          clearable={false}
          onChange={() => onProjectChange(formName, 'childConnections', [])}
          options={projects.map(p => ({ value: p.id, label: p.title }))}
        />
        <br />
        {currentCollectStep && (
          <Field
            name="fromProposals"
            id="childConnections"
            multi
            label="Propositions initiales"
            autoload
            help=""
            placeholder="Sélectionner des propositions initiales"
            component={select}
            filterOptions={(options, filter, currentValues) =>
              options
                .filter(o => o.stepId === currentCollectStep.id) // If step has changed, we hide previous steps
                .filter(o => !currentValues.includes(o))
            }
            loadOptions={input =>
              Fetcher.postToJson(`/collect_steps/${currentCollectStep.id}/proposals/search`, {
                terms: input,
              }).then(res => ({
                options: res.proposals.map(p => ({
                  value: p.id,
                  label: p.title,
                  stepId: currentCollectStep.id,
                })),
              }))
            }
          />
        )}
      </form>
    );
  }
}

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
  (state: State) => ({
    projects: getBudgetProjects(state.project.projectsById),
    currentCollectStep: getCurrentCollectStep(state),
  }),
  { onProjectChange: change },
)(
  reduxForm({
    form: formName,
    destroyOnUnmount: false,
    validate,
    onSubmit,
  })(ProposalFusionForm),
);
