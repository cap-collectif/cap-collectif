import * as React from 'react';
import {ConnectionHandler} from 'relay-runtime';
import {useIntl} from 'react-intl';
import {
    Button,
    ButtonGroup,
    CapUIIcon,
    CapUIModalSize,
    FormLabel,
    Heading,
    Modal,
    toast,
} from '@cap-collectif/ui';
import CreateQuestionnaireMutation from 'mutations/CreateQuestionnaireMutation';
import {graphql, useFragment} from 'react-relay';
import {useForm} from 'react-hook-form';
import {CreateFormModal_viewer$key} from '@relay/CreateFormModal_viewer.graphql';
import {FieldInput, FormControl} from '@cap-collectif/form';
import {mutationErrorToast} from '@utils/mutation-error-toast';
import {useAppContext} from '../AppProvider/App.context';
import CreateProposalFormMutation from "@mutations/CreateProposalFormMutation";
import {FormTypes} from "./FormListPage";

const formName = 'form-create-form';

type CreateFormModalProps = {
    orderBy: string;
    term: string;
    viewer: CreateFormModal_viewer$key;
    noResult?: boolean;
    initialValues?: FormValues

};

export type FormValues = {
    title: string
    type: FormTypes | null
};

type Options = {
    value: FormTypes
    label: string
}


const VIEWER_FRAGMENT = graphql`
    fragment CreateFormModal_viewer on User 
    @argumentDefinitions(
        term: { type: "String" }
        proposalFormAffiliations: { type: "[ProposalFormAffiliation!]" }
        questionnaireAffiliations: { type: "[QuestionnaireAffiliation!]" }
    )
    {
        __typename
        id
        username
        isAdmin
        organizations {
            __typename
            username
            id
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
    }
`;

const CreateFormModal: React.FC<CreateFormModalProps> = ({viewer: viewerFragment, orderBy, term, noResult = false, initialValues, }) => {
    const intl = useIntl();
    const {viewerSession} = useAppContext();
    const viewer = useFragment<CreateFormModal_viewer$key>(VIEWER_FRAGMENT, viewerFragment);
    const organization = viewer?.organizations?.[0];
    const owner = organization ?? viewer;

    const questionnairesCount = owner?.questionnaires?.totalCount;
    const analysisQuestionnairesCount = owner?.questionnaireAnalysis?.totalCount;
    const proposalFormsCount = owner?.proposalForms?.totalCount;

    const defaultValues = initialValues ?? {
        title: '',
        type: null,
    }

    const {
        handleSubmit,
        control,
        formState: {isSubmitting, isValid},
        reset,
    } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues,
    });

    const onSubmit = async (values: FormValues) => {
        const input = {
            title: values.title,
            owner: owner?.id,
        };

        switch (values.type) {
            case "QUESTIONNAIRE":
            case "QUESTIONNAIRE_ANALYSIS": {
                const hasQuestionnaire = values.type === "QUESTIONNAIRE" ? questionnairesCount > 0 : analysisQuestionnairesCount > 0
                const response = await CreateQuestionnaireMutation.commit(
                    {
                        input: {
                            ...input,
                            type: values.type
                        },
                        connections: [
                            ConnectionHandler.getConnectionID(
                                owner?.id,
                                'QuestionnaireList_questionnaires',
                                {
                                    query: term || "",
                                    affiliations: viewer.isAdmin ? null : ['OWNER'],
                                    orderBy: {field: 'CREATED_AT', direction: orderBy},
                                    type: values.type,
                                },
                            ),
                        ],
                    },
                    viewer.isAdmin,
                    owner,
                    viewer,
                    hasQuestionnaire,
                )
                if (!response.createQuestionnaire?.questionnaire) {
                    return mutationErrorToast(intl);
                }
                const adminUrl = response.createQuestionnaire?.questionnaire?.adminUrl;

                if (!hasQuestionnaire && adminUrl) {
                    window.location.href = adminUrl;
                }

                toast({
                    variant: 'success',
                    content: intl.formatMessage({id: 'questionnaire-successfully-created'}),
                });
                break;
            }
            case "PROPOSAL_FORM": {
                const hasProposalForm = proposalFormsCount > 0;
                const response = await CreateProposalFormMutation.commit(
                    {
                        input,
                        connections: [
                            ConnectionHandler.getConnectionID(owner.id, 'ProposalFormList_proposalForms', {
                                query: term || "",
                                affiliations: viewerSession.isAdmin ? null : ['OWNER'],
                                orderBy: {field: 'CREATED_AT', direction: orderBy},
                            }),
                        ],
                    },
                    viewerSession.isAdmin,
                    owner,
                    viewer,
                    hasProposalForm,
                )
                if (!response.createProposalForm?.proposalForm) {
                    return mutationErrorToast(intl);
                }

                const adminUrl = response.createProposalForm?.proposalForm.adminUrl;
                if (!hasProposalForm && adminUrl) {
                    window.location.href = adminUrl;
                }

                toast({
                    variant: 'success',
                    content: intl.formatMessage({id: 'proposal-form-successfully-created'}),
                });
            }
        }

        reset();
    }

    const formTypeOptions: Array<Options> =
        [
            {
                value: 'PROPOSAL_FORM',
                    label: intl.formatMessage({id: 'admin.fields.proposal.form'}),
            },
            {
                value: 'QUESTIONNAIRE',
                label: intl.formatMessage({
                    id: 'global.questionnaire',
                }),
            },
            {
                value: 'CONSULTATION',
                label: intl.formatMessage({
                    id: 'global.consultation',
                }),
            },
            {
                value: 'QUESTIONNAIRE_ANALYSIS',
                label: intl.formatMessage({
                    id: 'proposal_form.admin.evaluation',
                }),
            },
        ];

    return (
        <Modal
            disclosure={
                <Button
                    data-cy="create-form-button"
                    variant={noResult ? 'secondary' : 'primary'}
                    variantColor="primary"
                    variantSize={noResult ? 'big' : 'small'}
                    leftIcon={CapUIIcon.Add}
                    id="btn-add-form"
                    flexShrink={0}>
                    {intl.formatMessage({id: 'create-form'})}
                </Button>
            }
            onOpen={() => {
                reset(initialValues);
            }}
            size={CapUIModalSize.Sm}
            ariaLabel={intl.formatMessage({id: 'create-form'})}>
            {({hide}) => (
                <>
                    <Modal.Header>
                        <Heading>{intl.formatMessage({id: 'new-form'})}</Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <form id={formName}>
                            <FormControl name="title" control={control} isRequired>
                                <FormLabel
                                    htmlFor="title"
                                    label={intl.formatMessage({id: 'global.title'})}
                                />
                                <FieldInput
                                    data-cy="create-form-modal-title"
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder={intl.formatMessage({ id: 'global.title' })}
                                    control={control}
                                    minLength={2}
                                    maxLength={255}
                                />
                            </FormControl>
                            <FormControl name="type" control={control} isRequired>
                                <FormLabel
                                    htmlFor="type"
                                    label={intl.formatMessage({id: 'global.type'})}
                                />
                                <FieldInput
                                    name="type"
                                    control={control}
                                    options={formTypeOptions}
                                    type="select"
                                    placeholder={intl.formatMessage({
                                        id: 'create-form-type-placeholder',
                                    })}
                                />
                            </FormControl>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonGroup>
                            <Button
                                variantSize="medium"
                                variant="secondary"
                                variantColor="primary"
                                onClick={() => {
                                    reset();
                                    hide();
                                }}>
                                {intl.formatMessage({id: 'cancel'})}
                            </Button>
                            <Button
                                data-cy="create-form-modal-create-button"
                                type="submit"
                                variantSize="medium"
                                variant="primary"
                                variantColor="primary"
                                onClick={e => {
                                    handleSubmit((data: FormValues) => onSubmit(data))(e);
                                    hide();
                                }}
                                isLoading={isSubmitting}
                                id="confirm-form-create"
                                disabled={!isValid}
                            >
                                {intl.formatMessage({id: 'global.create'})}
                            </Button>
                        </ButtonGroup>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};

export default CreateFormModal;
