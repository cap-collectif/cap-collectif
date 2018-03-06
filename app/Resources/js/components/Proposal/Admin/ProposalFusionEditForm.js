// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Field, SubmissionError, reduxForm } from 'redux-form';
import { injectIntl, type IntlShape } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import Fetcher from '../../../services/Fetcher';
import select from '../../Form/Select';
import UpdateProposalFusionMutation from '../../../mutations/UpdateProposalFusionMutation';
import type { Dispatch, Uuid, State } from '../../../types';
import type { ProposalFusionEditForm_proposal } from './__generated__/ProposalFusionEditForm_proposal.graphql';

export const formName = 'update-proposal-fusion';

type RelayProps = {
  proposal: ProposalFusionEditForm_proposal
};

type FormValues = {
  fromProposals: $ReadOnlyArray<{ value: Uuid, title: string }>
};

type Props = RelayProps & { onClose: () => void, intl: IntlShape };

const validate = (values: FormValues, props: Props) => {
  const { intl } = props;
  const errors = {};
  if (!values.fromProposals || values.fromProposals.length < 2) {
    errors.fromProposals = intl.formatMessage({ id: 'please-select-at-least-2-proposals' });
  }
  return errors;
};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { intl } = props;
  return UpdateProposalFusionMutation.commit({
    input: {
      proposalId: props.proposal.id,
      fromProposals: values.fromProposals.map(proposal => proposal.value)
    }
  })
    .then(response => {
      if (!response.updateProposalFusion || !response.updateProposalFusion.proposal) {
        throw new Error('Mutation "updateProposalFusion" failed.');
      }
      props.onClose();
    })
    .catch(() => {
      throw new SubmissionError({
        _error: intl.formatMessage({ id: 'global.error.server.form' })
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
            Fetcher.postToJson(`/collect_steps/${stepId}/proposals/search`, {
              terms: input
            }).then(res => ({
              options: res.proposals
                .map(p => ({
                  value: p.id,
                  label: p.title
                }))
                .concat(
                  proposal.mergedFrom.map(p => ({
                    value: p.id,
                    label: p.title
                  }))
                )
            }))
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
  onSubmit
})(ProposalFusionEditForm);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => {
  return {
    initialValues: {
      fromProposals: props.proposal.mergedFrom.map(p => ({
        value: p.id,
        label: p.title
      }))
    }
  };
};
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
  `
);
