import { graphql } from 'react-relay';
import { environment } from 'utils/relay-environement';
import commitMutation from './commitMutation';
import type {
    DeleteQuestionnaireMutation,
    DeleteQuestionnaireMutationResponse,
    DeleteQuestionnaireMutationVariables,
} from '@relay/DeleteQuestionnaireMutation.graphql';
import {QuestionnaireType} from "@relay/QuestionnaireListQuery.graphql";

const mutation = graphql`
    mutation DeleteQuestionnaireMutation($input: DeleteQuestionnaireInput!, $connections: [ID!]!)
    @raw_response_type {
        deleteQuestionnaire(input: $input) {
            deletedQuestionnaireId @deleteEdge(connections: $connections)
        }
    }
`;

const commit = (
    variables: DeleteQuestionnaireMutationVariables,
    isAdmin: boolean,
    types?: Array<QuestionnaireType>
): Promise<DeleteQuestionnaireMutationResponse> =>
    commitMutation<DeleteQuestionnaireMutation>(environment, {
        mutation,
        variables,
        optimisticResponse: {
            deleteQuestionnaire: {
                deletedQuestionnaireId: variables.input.id,
            },
        },
        updater: store => {
            const payload = store.getRootField('deleteQuestionnaire');
            if (!payload) return;
            const errorCode = payload.getValue('errorCode');
            if (errorCode) return;

            const rootFields = store.getRoot();
            const viewer = rootFields.getLinkedRecord('viewer');
            if (!viewer) return;

            const organization = viewer.getLinkedRecords('organizations')[0] ?? null;
            const owner = organization ?? viewer;

            const args = {
                types
            };

            if (!isAdmin) {
                args['affiliations'] = ['OWNER'];
            }

            const questionnaires = owner.getLinkedRecord('questionnaires', args);

            if (!questionnaires) return;

            const totalCount = parseInt(String(questionnaires.getValue('totalCount')), 10);
            questionnaires.setValue(totalCount - 1, 'totalCount');
        },
    });

export default { commit };
