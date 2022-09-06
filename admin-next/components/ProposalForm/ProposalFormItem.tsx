import * as React from 'react';
import { useIntl, IntlShape } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import ModalConfirmationDelete from './ModalConfirmationDelete';
import type {
    ProposalFormItem_proposalForm,
    ProposalFormItem_proposalForm$key,
} from '@relay/ProposalFormItem_proposalForm.graphql';
import DuplicateProposalFormMutation from 'mutations/DuplicateProposalFormMutation';
import { mutationErrorToast } from 'utils/mutation-error-toast';
import { Table, Link, ButtonQuickAction, ButtonGroup, toast, CapUIIcon } from '@cap-collectif/ui';
import { useAppContext } from '../AppProvider/App.context';

export type Viewer = ProposalFormItem_proposalForm['owner'];

type ProposalFormItemProps = {
    proposalForm: ProposalFormItem_proposalForm$key,
    connectionName: string,
};

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
            __typename
            id
            username
        }
        creator {
            __typename
            id
            username
        }
        ...ModalConfirmationDelete_proposalForm
    }
`;

const duplicateProposalForm = (
    proposalFormDuplicated: ProposalFormItem_proposalForm,
    intl: IntlShape,
    owner: Viewer,
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
        owner,
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

const ProposalFormItem: React.FC<ProposalFormItemProps> = ({
    proposalForm: proposalFormFragment,
    connectionName,
}) => {
    const proposalForm = useFragment(FRAGMENT, proposalFormFragment);
    const intl = useIntl();
    const { viewerSession } = useAppContext();

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
            {viewerSession.isAdmin && <Table.Td>{proposalForm.creator?.username}</Table.Td>}
            {viewerSession.isAdmin || viewerSession.isAdminOrganization ? (
                <Table.Td>{proposalForm.owner?.username}</Table.Td>
            ) : null}
            <Table.Td>
                {intl.formatDate(proposalForm?.updatedAt ?? undefined, {
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
                        icon={CapUIIcon.Duplicate}
                        label={intl.formatMessage({ id: 'duplicate' })}
                        variantColor="blue"
                        onClick={() =>
                            duplicateProposalForm(
                                proposalForm,
                                intl,
                                proposalForm.owner,
                                connectionName,
                            )
                        }
                        className="btn-duplicate"
                    />
                    <ModalConfirmationDelete
                        proposalForm={proposalForm}
                        connectionName={connectionName}
                    />
                </ButtonGroup>
            </Table.Td>
        </>
    );
};

export default ProposalFormItem;
