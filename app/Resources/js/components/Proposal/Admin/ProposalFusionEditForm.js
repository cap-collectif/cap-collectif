// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { fetchQuery } from 'relay-runtime';
import { Field, SubmissionError, reduxForm } from 'redux-form';
import { injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import environment from '../../../createRelayEnvironment';
import select from '../../Form/Select';
import UpdateProposalFusionMutation from '../../../mutations/UpdateProposalFusionMutation';
import type { Dispatch, Uuid, State } from '../../../types';
import type { ProposalFusionEditForm_proposal } from './__generated__/ProposalFusionEditForm_proposal.graphql';

export const formName = 'update-proposal-fusion';

type RelayProps = {|
  proposal: ProposalFusionEditForm_proposal,
|};

type FormValues = {
  fromProposals: $ReadOnlyArray<{ value: Uuid, title: string }>,
};

type Props = {|
  ...RelayProps,
  // eslint-disable-next-line react/no-unused-prop-types
  onClose: () => void,
  intl: IntlShape,
|};

const validate = (values: FormValues, props: Props) => {
  const { intl } = props;
  const errors = {};
  if (!values.fromProposals || values.fromProposals.length < 2) {
    errors.fromProposals = intl.formatMessage({ id: 'please-select-at-least-2-proposals' });
  }
  return errors;
};

const query = graphql`
  query ProposalFusionEditFormAutocompleteQuery($stepId: ID!, $term: String) {
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

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  return UpdateProposalFusionMutation.commit({
    input: {
      proposalId: props.proposal.id,
      fromProposals: values.fromProposals.map(proposal => proposal.value),
    },
  })
    .then(response => {
      if (!response.updateProposalFusion || !response.updateProposalFusion.proposal) {
        throw new Error('Mutation "updateProposalFusion" failed.');
      }
      props.onClose();
    })
    .catch(() => {
      throw new SubmissionError({
        _error: intl.formatMessage({ id: 'global.error.server.form' }),
      });
    });
};

export class ProposalFusionEditForm extends React.Component<Props> {
  render() {
    const { proposal, intl } = this.props;
    if (!proposal.form.step) {
      return null;
    }
    const stepId = proposal.form.step.id;
    return (
      <form>
        <Field
          name="fromProposals"
          id="fromProposals"
          multi
          label="initial-proposals"
          autoload
          help={intl.formatMessage({ id: '2-proposals-minimum' })}
          placeholder="select-proposals"
          component={select}
          clearable={false}
          loadOptions={(input: string) =>
            fetchQuery(environment, query, { term: input, stepId }).then(res =>
              res.step.proposals.edges
                .map(edge => ({
                  value: edge.node.id,
                  label: edge.node.title,
                  stepId,
                }))
                .concat(
                  proposal.mergedFrom.map(p => ({
                    value: p.id,
                    label: p.title,
                  })),
                ),
            )
          }
        />
      </form>
    );
  }
}

const form = reduxForm({
  form: formName,
  enableReinitialize: true,
  validate,
  onSubmit,
})(ProposalFusionEditForm);

const mapStateToProps = (state: State, props: RelayProps) => ({
  initialValues: {
    fromProposals: props.proposal.mergedFrom.map(p => ({
      value: p.id,
      label: p.title,
    })),
  },
});
const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(
  container,
  graphql`
    fragment ProposalFusionEditForm_proposal on Proposal {
      id
      mergedFrom {
        id
        adminUrl
        title
      }
      form {
        step {
          id
        }
      }
    }
  `,
);
