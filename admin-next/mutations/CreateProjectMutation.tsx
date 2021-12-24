import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import { RecordSourceSelectorProxy } from 'relay-runtime';
import commitMutation from './commitMutation';
import type {
    CreateProjectMutation,
    CreateProjectMutationResponse,
    CreateProjectMutationVariables,
} from '@relay/CreateProjectMutation.graphql';

const mutation = graphql`
    mutation CreateProjectMutation($input: CreateProjectInput!, $connections: [ID!]!)
    @raw_response_type {
        createProject(input: $input) {
            project @prependNode(connections: $connections, edgeTypeName: "ProjectEdge") {
                ...ProjectItem_project
                adminAlphaUrl
            }
        }
    }
`;

const commit = (
    variables: CreateProjectMutationVariables,
    isAdmin: boolean,
    hasProject: boolean,
    owner: { value: string; label: string | null } | null,
): Promise<CreateProjectMutationResponse> =>
    commitMutation<CreateProjectMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            createProject: {
                project: {
                    id: new Date().toISOString(),
                    title: variables.input.title,
                    publishedAt: new Date().toISOString(),
                    themes: [],
                    visibility: isAdmin ? 'ADMIN' : 'ME',
                    adminAlphaUrl: '/',
                    url: '',
                    exportContributorsUrl: '',
                    exportableSteps: [],
                    owner: {
                        __typename: '',
                        id: owner?.value || '',
                        username: owner?.label || '',
                        url: '/',
                    },
                    contributions: { totalCount: 0 },
                },
            },
        },
        updater: (store: RecordSourceSelectorProxy) => {
            if (!hasProject) return;
            const payload = store.getRootField('createProject');
            if (!payload) return;
            const errorCode = payload.getValue('errorCode');
            if (errorCode) return;

            const rootFields = store.getRoot();
            const viewer = rootFields.getLinkedRecord('viewer');
            if (!viewer) return;
            const projects = viewer.getLinkedRecord('projects', {
                affiliations: isAdmin ? null : ['OWNER'],
            });
            if (!projects) return;
            const totalCount = parseInt(String(projects.getValue('totalCount')), 10);
            projects.setValue(totalCount + 1, 'totalCount');
        },
    });

export default { commit };
