// @flow
import * as React from 'react';
import { useIntl, type IntlShape } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import Table from '~ds/Table';
import ModalConfirmationDelete from './ModalConfirmationDelete';
import type {
  ProposalFormItem_proposalForm,
  ProposalFormItem_proposalForm$key,
} from '~relay/ProposalFormItem_proposalForm.graphql';
import Link from '~ds/Link/Link';
import ButtonQuickAction from '~ds/ButtonQuickAction/ButtonQuickAction';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import DuplicateProposalFormMutation from '~/mutations/DuplicateProposalFormMutation';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import { toast } from '~ds/Toast';

type Props = {|
  proposalForm: ProposalFormItem_proposalForm$key,
  connectionName: string,
  isAdmin: boolean,
|};

const FRAGMENT = graphql`
  fragment ProposalFormItem_proposalForm on ProposalForm {
    id
    title
    adminUrl
    createdAt
    updatedAt
    step {
      project {
        title
        adminAlphaUrl
      }
    }
    owner {
      username
    }
    ...ModalConfirmationDelete_proposalForm
  }
`;

const duplicateProposalForm = (
  proposalFormDuplicated: ProposalFormItem_proposalForm,
  intl: IntlShape,
  connectionName: string,
) => {
  const input = {
    id: proposalFormDuplicated.id,
  };

  return DuplicateProposalFormMutation.commit(
    {
      input,
      connections: [connectionName],
    },
    proposalFormDuplicated,
    intl,
  ).then(response => {
    if (response.duplicateProposalForm?.error) {
      return mutationErrorToast(intl);
    }

    toast({
      variant: 'success',
      content: intl.formatMessage({ id: 'proposal-form-successfully-duplicated' }),
    });
  });
};

const ProposalFormItem = ({
  proposalForm: proposalFormFragment,
  connectionName,
  isAdmin,
}: Props): React.Node => {
  const proposalForm = useFragment(FRAGMENT, proposalFormFragment);
  const intl = useIntl();

  return (
    <>
      <Table.Td>
        <Link href={proposalForm.adminUrl}>{proposalForm.title}</Link>
      </Table.Td>
      <Table.Td>
        {proposalForm?.step?.project ? (
          <Link href={proposalForm.step.project.adminAlphaUrl}>
            {proposalForm.step.project.title}
          </Link>
        ) : (
          proposalForm?.step?.project?.title
        )}
      </Table.Td>
      {isAdmin && <Table.Td>{proposalForm.owner?.username}</Table.Td>}
      <Table.Td>
        {intl.formatDate(proposalForm.updatedAt, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td>
        {intl.formatDate(proposalForm.createdAt, {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </Table.Td>
      <Table.Td visibleOnHover>
        <ButtonGroup>
          <ButtonQuickAction
            icon="DUPLICATE"
            label={intl.formatMessage({ id: 'duplicate' })}
            variantColor="primary"
            onClick={() => duplicateProposalForm(proposalForm, intl, connectionName)}
            className="btn-duplicate"
          />
          <ModalConfirmationDelete
            proposalForm={proposalForm}
            connectionName={connectionName}
            isAdmin={isAdmin}
          />
        </ButtonGroup>
      </Table.Td>
    </>
  );
};

export default ProposalFormItem;
