import * as React from 'react';
import {useIntl} from 'react-intl';
import {graphql, useFragment, useQueryLoader} from 'react-relay';
import {
    Flex,
    Search,
    InlineSelect,
    Box
} from '@cap-collectif/ui';
import debounce from '@utils/debounce-promise';
import TablePlaceholder from "@ui/Table/TablePlaceholder";
import ProposalFormListQuery, {PROPOSAL_FORM_LIST_QUERY} from "./ProposalFormListQuery";
import QuestionnaireListQuery, {QUESTIONNAIRE_LIST_QUERY} from "./QuestionnaireListQuery";
import type {ProposalFormListQuery as ProposalFormListQueryType} from '@relay/ProposalFormListQuery.graphql';
import type {QuestionnaireListQuery as QuestionnaireListQueryType} from '@relay/QuestionnaireListQuery.graphql';
import {Affiliations} from "./FormListQuery";
import {FormListPage_viewer$key} from "@relay/FormListPage_viewer.graphql";
import FormEmptyState from "./FormEmptyState";
import CreateFormModal from "./CreateFormModal";

const VIEWER_FRAGMENT = graphql`
    fragment FormListPage_viewer on User 
    @argumentDefinitions(
        term: { type: String }
        proposalFormAffiliations: { type: "[ProposalFormAffiliation!]" }
        questionnaireAffiliations: { type: "[QuestionnaireAffiliation!]" }
    )
    {
        organizations {
            proposalForms(
                query: $term
                affiliations: $proposalFormAffiliations
            ) {
                totalCount
            }    
            questionnaires(
                query: $term
                affiliations: $questionnaireAffiliations
                types: [QUESTIONNAIRE, VOTING]
            ) {
                totalCount
            }     
            questionnaireAnalysis: questionnaires(
                query: $term
                affiliations: $questionnaireAffiliations
                types: [QUESTIONNAIRE_ANALYSIS]
            ) {
                totalCount
            }    
        }
        proposalForms(
            query: $term
            affiliations: $proposalFormAffiliations
        ) {
            totalCount
        }
        questionnaires(
            query: $term
            affiliations: $questionnaireAffiliations
            types: [QUESTIONNAIRE, VOTING]
        ) {
            totalCount
        }     
        questionnaireAnalysis: questionnaires(
            query: $term
            affiliations: $questionnaireAffiliations
            types: [QUESTIONNAIRE_ANALYSIS]
        ) {
            totalCount
        }
        ...CreateFormModal_viewer
        @arguments(
            term: $term
            questionnaireAffiliations: $questionnaireAffiliations
            proposalFormAffiliations: $proposalFormAffiliations
        )
        ...FormEmptyState_viewer
        @arguments(
            term: $term
            questionnaireAffiliations: $questionnaireAffiliations
            proposalFormAffiliations: $proposalFormAffiliations
        )
    }

`

type Props = {
    viewer: FormListPage_viewer$key
    affiliations: Affiliations
}

export type FormTypes = 'PROPOSAL_FORM' | 'QUESTIONNAIRE' | 'CONSULTATION' | 'QUESTIONNAIRE_ANALYSIS'

const FormListPage: React.FC<Props> = ({viewer: viewerRef, affiliations}) => {
    const intl = useIntl();
    const viewer = useFragment(VIEWER_FRAGMENT, viewerRef);
    const [term, setTerm] = React.useState<string>('');
    const [selectedFormFilter, setSelectedFormFilter] = React.useState<FormTypes>('PROPOSAL_FORM');

    const [proposalFormQueryReference, loadProposalFormQuery, disposeProposalFormQuery] = useQueryLoader<ProposalFormListQueryType>(PROPOSAL_FORM_LIST_QUERY);
    const [questionnaireQueryReference, loadQuestionnaireQuery, disposeQuestionnaireQuery] = useQueryLoader<QuestionnaireListQueryType>(QUESTIONNAIRE_LIST_QUERY);
    const [questionnaireAnalysisQueryReference, loadquestionnaireAnalysisQueryReference, disposequestionnaireAnalysisQueryReference] = useQueryLoader<QuestionnaireListQueryType>(QUESTIONNAIRE_LIST_QUERY);

    const organization = viewer?.organizations?.[0];
    const owner = organization ?? viewer;

    const onTermChange = debounce((value: string) => {
        setTerm(value);
    }, 400);

    const resetTerm = () => {
        setTerm('');
    }

    const totalCounts: Record<FormTypes, number> = {
        'PROPOSAL_FORM': owner?.proposalForms?.totalCount ?? 0,
        'QUESTIONNAIRE': owner?.questionnaires?.totalCount ?? 0,
        'QUESTIONNAIRE_ANALYSIS': owner?.questionnaireAnalysis?.totalCount ?? 0,
        'CONSULTATION': 0 // todo implement when consultation is done
    }

    const queryVariables = {term, affiliations, orderBy: {field: 'CREATED_AT', direction: 'DESC'}, count: 20} as const;

    React.useEffect(() => {
        if (selectedFormFilter === 'PROPOSAL_FORM') {
            loadProposalFormQuery(queryVariables);
            return () => disposeProposalFormQuery();
        }
        if (selectedFormFilter === 'QUESTIONNAIRE_ANALYSIS') {
            loadquestionnaireAnalysisQueryReference({...queryVariables, types: ['QUESTIONNAIRE_ANALYSIS']});
            return () => disposeQuestionnaireQuery();
        }
        if (selectedFormFilter === 'QUESTIONNAIRE') {
            loadQuestionnaireQuery({...queryVariables, types: ['QUESTIONNAIRE']});
            return () => disposequestionnaireAnalysisQueryReference();
        }
    }, [selectedFormFilter, term]);

    return (
        <Flex direction="column" spacing={6}>
            <Flex
                direction="column"
                p={8}
                spacing={4}
                m={6}
                bg="white"
                borderRadius="normal"
                overflow="hidden">
                <Flex direction="row" justify="space-between">
                    <Flex direction="row" spacing={8}>
                        <CreateFormModal orderBy="DESC" viewer={viewer} term={term}/>
                        <Search
                            id="search-event"
                            value={term}
                            placeholder={intl.formatMessage({id: 'global.menu.search'})}
                            onChange={onTermChange}
                        />
                    </Flex>
                </Flex>
                <InlineSelect
                    onChange={value => {
                        setSelectedFormFilter(value as FormTypes)
                    }}
                    value={selectedFormFilter}>
                    <InlineSelect.Choice value="PROPOSAL_FORM">
                        {intl.formatMessage({id: 'collect_step'})} ({totalCounts['PROPOSAL_FORM']})
                    </InlineSelect.Choice>
                    <InlineSelect.Choice value="QUESTIONNAIRE">
                        <Box>
                            {intl.formatMessage({id: 'project.types.questionnaire'})} ({totalCounts['QUESTIONNAIRE']})
                        </Box>
                    </InlineSelect.Choice>
                    <InlineSelect.Choice value="QUESTIONNAIRE_ANALYSIS">
                        {intl.formatMessage({id: 'panel.analysis.subtitle'})} ({totalCounts['QUESTIONNAIRE_ANALYSIS']})
                    </InlineSelect.Choice>
                </InlineSelect>
                {
                    totalCounts[selectedFormFilter] > 0 ? (
                        <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={5}/>}>
                            {(selectedFormFilter === 'PROPOSAL_FORM' && proposalFormQueryReference) &&
                                <ProposalFormListQuery queryReference={proposalFormQueryReference} term={term}
                                                       resetTerm={resetTerm}
                                />}
                            {(selectedFormFilter === 'QUESTIONNAIRE_ANALYSIS' && questionnaireAnalysisQueryReference) &&
                                <QuestionnaireListQuery queryReference={questionnaireAnalysisQueryReference} term={term}
                                                       resetTerm={resetTerm} types={['QUESTIONNAIRE_ANALYSIS']}
                                />}
                            {(selectedFormFilter === 'QUESTIONNAIRE' && questionnaireQueryReference) &&
                                <QuestionnaireListQuery queryReference={questionnaireQueryReference} term={term}
                                                        resetTerm={resetTerm} types={['QUESTIONNAIRE', 'VOTING']}
                                />}
                        </React.Suspense>
                    ) : (
                        <FormEmptyState formType={selectedFormFilter} term={term} viewer={viewer} />
                    )
                }
            </Flex>
        </Flex>
    );
};

export default FormListPage;
