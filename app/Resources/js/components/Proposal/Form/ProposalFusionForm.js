// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'relay-runtime';
import { createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Field, SubmissionError, reduxForm, formValueSelector, change } from 'redux-form';
import select from '../../Form/Select';
import environment from '../../../createRelayEnvironment';
import CreateProposalFusionMutation, {
  type CreateProposalFusionMutationResponse,
} from '../../../mutations/CreateProposalFusionMutation';
import { closeCreateFusionModal } from '../../../redux/modules/proposal';
import type { State, Dispatch, Uuid } from '../../../types';
import type { ProposalFusionForm_query } from '~relay/ProposalFusionForm_query.graphql';

export const formName = 'create-proposal-fusion';

const autocompleteQuery = graphql`
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

type FormValues = {|
  project: ?Uuid,
  fromProposals: $ReadOnlyArray<{ value: Uuid }>,
|};

type Step = {|
  +id: string,
  +type: string,
|};

type Props = {|
  currentCollectStep: ?Step,
  onProjectChange: (form: string, field: string, value: any) => void,
  intl: IntlShape,
  query: ProposalFusionForm_query,
|};

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
  constructor(props: Props) {
    super(props);
    this.myRef = React.createRef();
  }

  handleChange = () => {
    const { onProjectChange } = this.props;

    onProjectChange(formName, 'fromProposals', []);
    if (this.myRef.current) {
      this.myRef.current.getRenderedComponent().clearValues();
    }
  };

  myRef: any;

  render() {
    const { currentCollectStep, query, intl } = this.props;
    if (!query.projects.edges) return null;
    const projects = query.projects.edges
      .filter(Boolean)
      .map(p => p.node)
      .filter(p => p.steps.filter(s => s.type === 'collect').length > 0);
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
            filterOption={option => option && option.data.stepId === currentCollectStep.id}
            loadOptions={input =>
              fetchQuery(environment, autocompleteQuery, {
                term: input,
                stepId: currentCollectStep.id,
              }).then(res => {
                const options = res.step.proposals.edges.map(edge => ({
                  value: edge.node.id,
                  label: edge.node.title,
                  stepId: currentCollectStep.id,
                }));

                return options;
              })
            }
          />
        )}
      </form>
    );
  }
}

const getSelectedProjectId = (state: State): Uuid => formValueSelector(formName)(state, 'project');

const getCurrentCollectStep = (state: State, props: Props): ?Object => {
  const id = getSelectedProjectId(state);
  if (!id || !props.query.projects.edges) {
    return null;
  }

  const project = props.query.projects.edges
    .filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .find(p => p.id === id);
  if (!project || !project.steps) {
    return null;
  }
  return project.steps.filter(s => s.type === 'collect')[0];
};

const mapStateToProps = (state: State, props: Props) => ({
  currentCollectStep: getCurrentCollectStep(state, props),
  currentProjectId: getSelectedProjectId(state),
});

const form = reduxForm({
  form: formName,
  destroyOnUnmount: false,
  validate,
  onSubmit,
})(ProposalFusionForm);

const container = connect(
  mapStateToProps,
  { onProjectChange: change },
)(injectIntl(form));

export default createFragmentContainer(container, {
  query: graphql`
    fragment ProposalFusionForm_query on Query {
      projects {
        edges {
          node {
            id
            title
            steps {
              id
              type
            }
          }
        }
      }
    }
  `,
});
