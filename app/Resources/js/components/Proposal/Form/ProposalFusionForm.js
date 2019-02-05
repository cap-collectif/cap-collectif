// @flow
import * as React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'relay-runtime';
import { injectIntl, type IntlShape } from 'react-intl';
import { Field, SubmissionError, reduxForm, formValueSelector, change } from 'redux-form';
import select from '../../Form/Select';
import environment from '../../../createRelayEnvironment';
import CreateProposalFusionMutation, {
  type CreateProposalFusionMutationResponse,
} from '../../../mutations/CreateProposalFusionMutation';
import { closeCreateFusionModal } from '../../../redux/modules/proposal';
import type { State, Dispatch, Uuid } from '../../../types';

export const formName = 'create-proposal-fusion';

const query = graphql`
  query ProposalFusionFormAutocompleteQuery($stepId: ID!, $term: String) {
    step: node(id: $stepId) {
      ... on CollectStep {
        proposals(first: 10, term: $term) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  }
`;

type FormValues = {
  project: ?Uuid,
  fromProposals: $ReadOnlyArray<{ value: Uuid }>,
};

type Props = {
  projects: Array<Object>,
  currentCollectStep: Object,
  onProjectChange: (form: string, field: string, value: any) => void,
  intl: IntlShape,
};

const validate = (values: FormValues, props: Props) => {
  const { intl } = props;
  const errors = {};
  if (!values.project) {
    errors.project = intl.formatMessage({ id: 'please-select-a-participatory-project' });
  }
  if (!values.fromProposals || values.fromProposals.length < 2) {
    errors.fromProposals = intl.formatMessage({ id: 'please-select-at-least-2-proposals' });
  }
  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch) =>
  CreateProposalFusionMutation.commit({
    input: { fromProposals: values.fromProposals.map(proposal => proposal.value) },
  })
    .then((response: CreateProposalFusionMutationResponse) => {
      if (!response.createProposalFusion || !response.createProposalFusion.proposal) {
        throw new Error('Mutation "createProposalFusion" failed.');
      }
      const createdProposal = response.createProposalFusion.proposal;
      dispatch(closeCreateFusionModal());
      window.location.href = createdProposal.adminUrl;
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });

export class ProposalFusionForm extends React.Component<Props> {
  myRef: any;

  constructor(props: Props) {
    super(props);
    this.myRef = React.createRef();
  }

  handleChange = () => {
    const { onProjectChange } = this.props;

    onProjectChange(formName, 'fromProposals', []);
    if (this.myRef.current) {
      console.log(ReactDOM.findDOMNode(this.myRef.current));
      this.myRef.current.getRenderedComponent().clearValues();
    }
  };

  render() {
    const { currentCollectStep, projects, intl } = this.props;

    return (
      <form>
        <Field
          name="project"
          id="ProposalFusionForm-project"
          label={intl.formatMessage({ id: 'admin.fields.proposal.project' })}
          placeholder={intl.formatMessage({ id: 'select-a-participatory-project' })}
          isLoading={projects.length === 0}
          component={select}
          clearable={false}
          onChange={this.handleChange}
          options={projects.map(p => ({ value: p.id, label: p.title }))}
        />
        {currentCollectStep && (
          <Field
            name="fromProposals"
            id="ProposalFusionForm-fromProposals"
            multi
            ref={this.myRef}
            withRef
            label={intl.formatMessage({ id: 'initial-proposals' })}
            autoload
            help={intl.formatMessage({ id: '2-proposals-minimum' })}
            placeholder={intl.formatMessage({ id: 'select-proposals' })}
            component={select}
            filterOption={option => {
              if (option && option.data.stepId === currentCollectStep.id) {
                return true;
              }

              return false;
            }}
            loadOptions={input =>
              fetchQuery(environment, query, { term: input, stepId: currentCollectStep.id }).then(
                res => {
                  const options = res.step.proposals.edges.map(edge => ({
                    value: edge.node.id,
                    label: edge.node.title,
                    stepId: currentCollectStep.id,
                  }));

                  return options;
                },
              )
            }
          />
        )}
      </form>
    );
  }
}

const getBudgetProjects = (projects: { [id: Uuid]: Object }): Array<Object> =>
  Object.keys(projects)
    .map(key => projects[key])
    .filter(p => p.steps.filter(s => s.type === 'collect').length > 0);

const getSelectedProjectId = (state: State): Uuid => formValueSelector(formName)(state, 'project');

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

const mapStateToProps = (state: State) => ({
  projects: getBudgetProjects(state.project.projectsById),
  currentCollectStep: getCurrentCollectStep(state),
});

const form = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  validate,
  onSubmit,
})(ProposalFusionForm);

export default connect(
  mapStateToProps,
  { onProjectChange: change },
)(injectIntl(form));
