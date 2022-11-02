import * as React from 'react';
import { ConnectionHandler } from 'relay-runtime';
import { useIntl } from 'react-intl';
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
import { graphql, useFragment } from 'react-relay';
import { useForm } from 'react-hook-form';
import { ModalCreateQuestionnaire_viewer$key } from '@relay/ModalCreateQuestionnaire_viewer.graphql';
import { FieldInput, FormControl, MultipleRadioValue } from '@cap-collectif/form';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import { useAppContext } from '../AppProvider/App.context';
import type { QuestionnaireType } from '@relay/CreateQuestionnaireMutation.graphql';

const formName = 'form-create-questionnaire';

type ModalCreateQuestionnaireProps = {
    orderBy: string,
    term: string,
    hasQuestionnaire: boolean,
    noResult?: boolean,
    viewer: ModalCreateQuestionnaire_viewer$key,
};

type FormValues = {
    title: string,
    type: MultipleRadioValue,
};

const FRAGMENT = graphql`
    fragment ModalCreateQuestionnaire_viewer on User {
        __typename
        id
        username
        organizations {
            id
        }
    }
`;

const ModalCreateQuestionnaire: React.FC<ModalCreateQuestionnaireProps> = ({
    viewer: viewerFragment,
    hasQuestionnaire,
    orderBy,
    term,
    noResult,
}) => {
    const intl = useIntl();
    const { viewerSession } = useAppContext();
    const viewer = useFragment<ModalCreateQuestionnaire_viewer$key>(FRAGMENT, viewerFragment);
    const organization = viewer?.organizations?.[0];

    const initialValues: FormValues = {
        title: '',
        type: {
            labels: ['QUESTIONNAIRE'],
        },
    };

    const { handleSubmit, control, formState: { isSubmitting }, reset } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: initialValues,
    });

    const onSubmit = (values: FormValues) => {
        const input = {
            type: (values.type.labels[0] as QuestionnaireType) || 'QUESTIONNAIRE',
            title: values.title,
            owner: organization?.id,
        };

        return CreateQuestionnaireMutation.commit(
            {
                input,
                connections: [
                    ConnectionHandler.getConnectionID(
                        viewer.id,
                        'QuestionnaireList_questionnaires',
                        {
                            query: term || null,
                            affiliations: viewerSession.isAdmin ? null : ['OWNER'],
                            orderBy: { field: 'CREATED_AT', direction: orderBy },
                        },
                    ),
                ],
            },
            viewerSession.isAdmin,
            viewer,
            hasQuestionnaire,
        ).then(response => {
            if (!response.createQuestionnaire?.questionnaire) {
                return mutationErrorToast(intl);
            }

            const adminUrl = response.createQuestionnaire?.questionnaire?.adminUrl;

            if (!hasQuestionnaire && adminUrl) {
                window.location.href = adminUrl;
            }

            toast({
                variant: 'success',
                content: intl.formatMessage({ id: 'questionnaire-successfully-created' }),
            });
        });
    };

    return (
        <Modal
            disclosure={
                <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize={noResult ? 'big' : 'small'}
                    leftIcon={CapUIIcon.Add}
                    id="btn-add-questionnaire"
                    flexShrink={0}>
                    {intl.formatMessage({ id: 'create-questionnaire' })}
                </Button>
            }
            onOpen={() => {
                reset(initialValues)
            }}
            size={CapUIModalSize.Md}
            ariaLabel={intl.formatMessage({ id: 'create-questionnaire' })}>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Heading>{intl.formatMessage({ id: 'global.questionnaire' })}</Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <form id={formName}>
                            <FormControl name="type" control={control} isRequired>
                                <FieldInput
                                    type="radio"
                                    name="type"
                                    id="type"
                                    control={control}
                                    choices={[
                                        {
                                            id: 'VOTING',
                                            useIdAsValue: true,
                                            label: intl.formatMessage({ id: 'voting' }),
                                        },
                                        {
                                            id: 'QUESTIONNAIRE',
                                            useIdAsValue: true,
                                            label: intl.formatMessage({
                                                id: 'global.questionnaire',
                                            }),
                                        },
                                    ]}
                                />
                            </FormControl>

                            <FormControl name="title" control={control} isRequired>
                                <FormLabel
                                    htmlFor="title"
                                    label={intl.formatMessage({ id: 'global.title' })}
                                />
                                <FieldInput
                                    type="text"
                                    id="title"
                                    name="title"
                                    control={control}
                                    placeholder={intl.formatMessage({
                                        id: 'questionnaire-title-placeholder',
                                    })}
                                    minLength={2}
                                    maxLength={255}
                                />
                            </FormControl>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonGroup>
                            <Button
                                variantSize="medium"
                                variant="secondary"
                                variantColor="hierarchy"
                                onClick={hide}>
                                {intl.formatMessage({ id: 'cancel' })}
                            </Button>
                            <Button
                                type="submit"
                                variantSize="medium"
                                variant="primary"
                                variantColor="primary"
                                onClick={e => {
                                    handleSubmit((data: FormValues) => onSubmit(data))(e);
                                    hide();
                                }}
                                isLoading={isSubmitting}
                                id="confirm-questionnaire-create">
                                {intl.formatMessage({ id: 'global.send' })}
                            </Button>
                        </ButtonGroup>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};

export default ModalCreateQuestionnaire;
