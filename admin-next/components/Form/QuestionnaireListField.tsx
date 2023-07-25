import * as React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import type {
    QuestionnaireListFieldQuery,
    QuestionnaireListFieldQueryResponse,
} from '@relay/QuestionnaireListFieldQuery.graphql';
import { environment } from 'utils/relay-environement';
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form';

interface QuestionnaireListFieldProps
    extends Omit<BaseField, 'onChange'>,
        Omit<FieldSelect, 'type'> {
    questionnaireIdsToNoSearch?: string[];
    authorOfEvent?: boolean;
}

type QuestionnaireListFieldValue = {
    label: string;
    value: string;
};

const getQuestionnaireList = graphql`
    query QuestionnaireListFieldQuery($term: String, $affiliations: [QuestionnaireAffiliation!]) {
        viewer {
            questionnaires(query: $term, affiliations: $affiliations, availableOnly: true) {
                edges {
                    node {
                        id
                        title
                    }
                }
            }
            organizations {
                questionnaires(query: $term, affiliations: $affiliations, availableOnly: true) {
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

const formatQuestionnairesData = (
    // @ts-ignore
    questionnaires: QuestionnaireListFieldQueryResponse['questionnaireSearch'],
) => {
    if (!questionnaires) return [];

    return questionnaires.map(questionnaire => {
        if (questionnaire) {
            const { id, title } = questionnaire;
            return {
                value: id,
                label: title,
            };
        }
    });
};

export const QuestionnaireListField: React.FC<QuestionnaireListFieldProps> = ({
    questionnaireIdsToNoSearch = [],
    authorOfEvent = false,
    name,
    control,
    ...props
}) => {
    const loadOptions = async (search: string): Promise<QuestionnaireListFieldValue[]> => {
        const questionnairesData = await fetchQuery<QuestionnaireListFieldQuery>(
            environment,
            getQuestionnaireList,
            {
                term: search,
                affiliations: null,
            },
        ).toPromise();

        const questionnairesEdges =
            questionnairesData?.viewer.organizations?.[0]?.questionnaires?.edges ??
            questionnairesData?.viewer.questionnaires?.edges;

        if (questionnairesEdges) {
            return formatQuestionnairesData(questionnairesEdges.map(e => ({ ...e.node })));
        }

        return [];
    };

    return (
        // @ts-ignore
        <FieldInput
            {...props}
            type="select"
            control={control}
            name={name}
            defaultOptions
            loadOptions={loadOptions}
        />
    );
};

export default QuestionnaireListField;
