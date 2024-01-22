import { graphql } from 'react-relay';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    CreateProposalFormMutation,
    CreateProposalFormMutationResponse,
    CreateProposalFormMutationVariables,
} from '@relay/CreateProposalFormMutation.graphql';
import {CreateFormModal_viewer} from '@relay/CreateFormModal_viewer.graphql';

type Owner = {
    readonly __typename: string;
    readonly id: string;
    readonly username: string | null;
};

type Viewer = Pick<CreateFormModal_viewer, '__typename' | 'id' | 'username'>

const mutation = graphql`
    mutation CreateProposalFormMutation($input: CreateProposalFormInput!, $connections: [ID!]!)
    @raw_response_type {
        createProposalForm(input: $input) {
            proposalForm @prependNode(connections: $connections, edgeTypeName: "ProposalFormEdge") {
                ...ProposalFormItem_proposalForm
                adminUrl
                id
                title
            }
        }
    }
`;

const commit = (
    variables: CreateProposalFormMutationVariables,
    isAdmin: boolean,
    owner: Owner,
    viewer: Viewer,
    hasProposalForm: boolean,
): Promise<CreateProposalFormMutationResponse> =>
    commitMutation<CreateProposalFormMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            createProposalForm: {
                proposalForm: {
                    id: new Date().toISOString(),
                    title: variables.input.title,
                    createdAt: new Date().toString(),
                    updatedAt: new Date().toString(),
                    step: null,
                    adminUrl: '',
                    owner: {
                        __typename: owner.__typename,
                        id: owner.id,
                        username: owner.username,
                    },
                    creator: {
                        __typename: viewer.__typename,
                        id: viewer.id,
                        username: viewer.username,
                    },
                },
            },
        },
        updater: (store: RecordSourceSelectorProxy) => {
            if (!hasProposalForm) return;
            const payload = store.getRootField('createProposalForm');
            if (!payload) return;
            const errorCode = payload.getValue('errorCode');
            if (errorCode) return;

            const rootFields = store.getRoot();
            const viewer = rootFields.getLinkedRecord('viewer');
            if (!viewer) return;

            const organization = viewer.getLinkedRecords('organizations')[0] ?? null;
            const owner = organization ?? viewer;

            const proposalForms = owner.getLinkedRecord('proposalForms', {
                affiliations: isAdmin ? null : ['OWNER'],
            });
            if (!proposalForms) return;

            const proposalFormsTotalCount = parseInt(
                String(proposalForms.getValue('totalCount')),
                10,
            );
            proposalForms.setValue(proposalFormsTotalCount + 1, 'totalCount');
        },
    });

export default { commit };
