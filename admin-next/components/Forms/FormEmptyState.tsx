import React from 'react'
import {CapUISpotIcon, CapUISpotIconSize, Flex, Heading, SpotIcon, Text} from "@cap-collectif/ui";
import {useIntl} from "react-intl";
import {FormTypes} from "./FormListPage";
import CreateFormModal, {FormValues} from "./CreateFormModal";
import {graphql, useFragment} from "react-relay";
import {FormEmptyState_viewer$key} from "@relay/FormEmptyState_viewer.graphql";

type Props = {
    formType: string
    term: string
    viewer: FormEmptyState_viewer$key,
}

type Config = {
    spotIconName: CapUISpotIcon
    heading: string
    body: string
    buttonText: string
}

const VIEWER_FRAGMENT = graphql`
    fragment FormEmptyState_viewer on User 
    @argumentDefinitions(
        term: { type: "String" }
        proposalFormAffiliations: { type: "[ProposalFormAffiliation!]" }
        questionnaireAffiliations: { type: "[QuestionnaireAffiliation!]" }
    )
    {
        ...CreateFormModal_viewer
        @arguments(
            term: $term
            questionnaireAffiliations: $questionnaireAffiliations
            proposalFormAffiliations: $proposalFormAffiliations
        )
    }
`;


const FormEmptyState: React.FC<Props> = ({ formType, viewer: viewerRef, term }) => {

    const intl = useIntl();
    const viewer = useFragment(VIEWER_FRAGMENT, viewerRef);

    const config: Record<FormTypes, Config> = {
        'PROPOSAL_FORM': {
            spotIconName: CapUISpotIcon.FORM,
            heading: intl.formatMessage({id: 'proposalform-empty-state-heading'}),
            body: intl.formatMessage({id: 'proposalform-empty-state-body'}),
            buttonText: intl.formatMessage({id: 'create-form'}),
        },
        'QUESTIONNAIRE': {
            spotIconName: CapUISpotIcon.QUESTIONNAIRE,
            heading: intl.formatMessage({id: 'questionnaire-empty-state-heading'}),
            body: intl.formatMessage({id: 'questionnaire-empty-state-body'}),
            buttonText: intl.formatMessage({id: 'create-questionnaire'}),
        },
        'QUESTIONNAIRE_ANALYSIS': {
            spotIconName: CapUISpotIcon.ANALYSIS,
            heading: intl.formatMessage({id: 'proposalform-analysis-empty-state-heading'}),
            body: intl.formatMessage({id: 'proposalform-analysis-empty-state-body'}),
            buttonText: intl.formatMessage({id: 'create-proposalform-analysis'}),
        },
        'CONSULTATION': {
            spotIconName: CapUISpotIcon.USER_DISCUSS,
            heading: intl.formatMessage({id: 'consultation-empty-state-heading'}),
            body: intl.formatMessage({id: 'consultation-empty-state-body'}),
            buttonText: intl.formatMessage({id: 'create-consultation'}),
        }
    }

    const initialValues: FormValues = {
        title: '',
        type: formType as FormTypes
    }

    return (
        <Flex
            direction="row"
            spacing={8}
            bg="white"
            py="96px"
            px="111px"
            mt={6}
            mx={6}
            borderRadius="normal"
        >
            <SpotIcon name={config[formType].spotIconName} size={CapUISpotIconSize.Lg} />
            <Flex direction="column" color="blue.900" align="flex-start" width="535px">
                <Heading as="h3" mb={2}>
                    {intl.formatMessage({ id: config[formType].heading })}
                </Heading>
                <Text mb={8}>{intl.formatMessage({ id: config[formType].body })}</Text>
                <CreateFormModal orderBy="DESC" term={term} viewer={viewer} initialValues={initialValues} noResult />
            </Flex>
        </Flex>
    )
}

export default FormEmptyState