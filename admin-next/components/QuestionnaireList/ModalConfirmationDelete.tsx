import * as React from 'react';
import { IntlShape, useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import {
    Button,
    ButtonGroup,
    ButtonQuickAction,
    CapUIIcon,
    CapUIModalSize,
    Heading,
    Modal,
    Text,
    toast,
} from '@cap-collectif/ui';
import type { ModalConfirmationDelete_questionnaire$key } from '@relay/ModalConfirmationDelete_questionnaire.graphql';
import DeleteQuestionnaireMutation from 'mutations/DeleteQuestionnaireMutation';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import { useAppContext } from '../AppProvider/App.context';

type Props = {
    questionnaire: ModalConfirmationDelete_questionnaire$key,
    connectionName: string,
};

const FRAGMENT = graphql`
    fragment ModalConfirmationDelete_questionnaire on Questionnaire {
        id
        title
    }
`;

const deleteQuestionnaire = (
    questionnaireId: string,
    hide: () => void,
    intl: IntlShape,
    connectionName: string,
    isAdmin: boolean,
) => {
    const input = {
        id: questionnaireId,
    };
    hide();

    return DeleteQuestionnaireMutation.commit({ input, connections: [connectionName] }, isAdmin)
        .then(() => {
            toast({
                variant: 'success',
                content: intl.formatMessage({ id: 'questionnaire-successfully-deleted' }),
            });
        })
        .catch(() => {
            return mutationErrorToast(intl);
        });
};

const ModalConfirmationDelete: React.FC<Props> = ({
    questionnaire: questionnaireFragment,
    connectionName,
}) => {
    const questionnaire = useFragment(FRAGMENT, questionnaireFragment);
    const { viewerSession } = useAppContext();
    const intl = useIntl();

    return (
        <Modal
            ariaLabel={intl.formatMessage({ id: 'delete-confirmation' })}
            disclosure={
                <ButtonQuickAction
                    icon={CapUIIcon.Trash}
                    label={intl.formatMessage({ id: 'global.delete' })}
                    variantColor="red"
                />
            }
            size={CapUIModalSize.Md}>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Heading>{intl.formatMessage({ id: 'delete-confirmation' })}</Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <Text>
                            {intl.formatMessage(
                                { id: 'are-you-sure-to-delete-something' },
                                { element: questionnaire.title },
                            )}
                        </Text>
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
                                variantSize="medium"
                                variant="primary"
                                variantColor="danger"
                                onClick={() =>
                                    deleteQuestionnaire(
                                        questionnaire.id,
                                        hide,
                                        intl,
                                        connectionName,
                                        viewerSession.isAdmin,
                                    )
                                }>
                                {intl.formatMessage({ id: 'global.delete' })}
                            </Button>
                        </ButtonGroup>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};

export default ModalConfirmationDelete;
