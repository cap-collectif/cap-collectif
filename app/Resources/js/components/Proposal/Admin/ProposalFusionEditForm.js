// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field, SubmissionError, reduxForm } from 'redux-form';
import Fetcher from '../../../services/Fetcher';
import select from '../../Form/Select';
import UpdateProposalFusionMutation from '../../../mutations/UpdateProposalFusionMutation';
import type { Dispatch, Uuid } from '../../../types';

export const formName = 'update-proposal-fusion';

type FormValues = {
  fromProposals: $ReadOnlyArray<{ value: Uuid }>,
};

const validate = (values: FormValues) => {
  const errors = {};
  if (!values.fromProposals || values.fromProposals.length < 2) {
    errors.fromProposals = 'please-select-at-least-2-proposals';
  }
  return errors;
};

type Props = {
  proposal: Object,
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
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
      // dispatch(closeUpdateFusionModal());
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

export class ProposalFusionEditForm extends React.Component<Props> {
  render() {
    const { stepId } = this.props.proposal.form.step.id;
    return (
      <form>
        <Field
          name="fromProposals"
          id="childConnections"
          multi
          label="initial-proposals"
          autoload
          help="2-proposals-minimum"
          placeholder="select-proposals"
          component={select}
          loadOptions={input =>
            Fetcher.postToJson(`/collect_steps/${stepId}/proposals/search`, {
              terms: input,
            }).then(res => ({
              options: res.proposals.map(p => ({
                value: p.id,
                label: p.title,
                stepId,
              })),
            }))
          }
        />
      </form>
    );
  }
}

const form = reduxForm({
  form: formName,
  validate,
  onSubmit,
})(ProposalFusionEditForm);

export default createFragmentContainer(
  form,
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
