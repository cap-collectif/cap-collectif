import * as React from 'react';
import { ConnectionHandler } from 'relay-runtime';
import CreateProposalFormMutation from 'mutations/CreateProposalFormMutation';
import {
    Button,
    Modal,
    Heading,
    ButtonGroup,
    toast,
    CapUIModalSize,
    FormLabel,
    CapUIIcon,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { FieldInput, FormControl } from '@cap-collectif/form';
import { useForm } from 'react-hook-form';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import { graphql, useFragment } from 'react-relay';
import { ModalCreateProposalForm_viewer$key } from '@relay/ModalCreateProposalForm_viewer.graphql';
import { useAppContext } from '../AppProvider/App.context';

type ModalCreateProposalFormProps = {
    viewer: ModalCreateProposalForm_viewer$key;
    term: string;
    orderBy: string;
    hasProposalForm: boolean;
    noResult?: boolean;
};

type FormValues = {
    title: string;
};

const formName = 'form-create-proposalForm';

const FRAGMENT = graphql`
    fragment ModalCreateProposalForm_viewer on User {
        __typename
        id
        username
        organizations {
            __typename
            id
            username
        }
    }
`;

const ModalCreateProposalForm: React.FC<ModalCreateProposalFormProps> = ({
    viewer: viewerFragment,
    term,
    orderBy,
    hasProposalForm,
    noResult,
}) => {
    const intl = useIntl();
    const { viewerSession } = useAppContext();
    const viewer = useFragment<ModalCreateProposalForm_viewer$key>(FRAGMENT, viewerFragment);

    const initialValues: FormValues = {
        title: '',
    };

    const { handleSubmit, control, formState, reset } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: initialValues,
    });

    const { isSubmitting, isValid } = formState;

    const onSubmit = (values: FormValues) => {
        const owner = viewer?.organizations?.[0] ?? viewer;

        const input = {
            title: values.title,
            owner: owner.id,
        };

        return CreateProposalFormMutation.commit(
            {
                input,
                connections: [
                    ConnectionHandler.getConnectionID(owner.id, 'ProposalFormList_proposalForms', {
                        query: term || null,
                        affiliations: viewerSession.isAdmin ? null : ['OWNER'],
                        orderBy: { field: 'CREATED_AT', direction: orderBy },
                    }),
                ],
            },
            viewerSession.isAdmin,
            owner,
            viewer,
            hasProposalForm,
        ).then(response => {
            if (!response.createProposalForm?.proposalForm) {
                return mutationErrorToast(intl);
            }

            const adminUrl = response.createProposalForm?.proposalForm.adminUrl;
            if (!hasProposalForm && adminUrl) {
                window.location.href = adminUrl;
            }

            toast({
                variant: 'success',
                content: intl.formatMessage({ id: 'proposal-form-successfully-created' }),
            });
        });
    };

    return (
        <Modal
            ariaLabel={intl.formatMessage({ id: 'proposal_form.create.title' })}
            size={CapUIModalSize.Md}
            onOpen={() => {
                reset(initialValues);
            }}
            disclosure={
                <Button
                    data-cy="create-proposalform-button"
                    variant="primary"
                    variantColor="primary"
                    variantSize={noResult ? 'big' : 'small'}
                    leftIcon={CapUIIcon.Add}
                    id="btn-add-proposalForm">
                    {intl.formatMessage({ id: 'create-form' })}
                </Button>
            }>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Heading>
                            {intl.formatMessage({ id: 'proposal_form.create.title' })}
                        </Heading>
                    </Modal.Header>
                    <Modal.Body height="auto">
                        <form id={formName}>
                            <FormControl name="title" control={control} isRequired>
                                <FormLabel
                                    htmlFor="title"
                                    label={intl.formatMessage({ id: 'global.title' })}
                                />
                                <FieldInput
                                    data-cy="create-proposalform-modal-title"
                                    id="title"
                                    name="title"
                                    control={control}
                                    type="text"
                                    placeholder={intl.formatMessage({
                                        id: 'create-proposalform-title-placeholder',
                                    })}
                                    minLength={2}
                                    maxLength={255}
                                />
                            </FormControl>
                        </form>
                    </Modal.Body>
                    <Modal.Footer spacing={2}>
                        <ButtonGroup>
                            <Button
                                variantSize="medium"
                                variant="secondary"
                                variantColor="hierarchy"
                                onClick={hide}>
                                {intl.formatMessage({ id: 'cancel' })}
                            </Button>
                            <Button
                                data-cy="create-proposalform-modal-create-button"
                                variantSize="medium"
                                variant="primary"
                                variantColor="primary"
                                isLoading={isSubmitting}
                                onClick={e => {
                                    if (isValid) {
                                        handleSubmit((data: FormValues) => onSubmit(data))(e);
                                        hide();
                                    }
                                }}>
                                {intl.formatMessage({ id: 'global.send' })}
                            </Button>
                        </ButtonGroup>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};

export default ModalCreateProposalForm;
