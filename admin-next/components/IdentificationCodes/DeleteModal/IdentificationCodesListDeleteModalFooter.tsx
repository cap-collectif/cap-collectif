import DeleteUserIdentificationCodeListMutation from '../../../mutations/DeleteUserIdentificationCodeListMutation';
import { FC } from 'react';
import { useIntl } from 'react-intl';
import { Button, Modal, toast } from '@cap-collectif/ui';

const deleteList = (id: string, connectionName: string, callback: () => void): void => {
    DeleteUserIdentificationCodeListMutation.commit({
        input: { id },
        connections: [connectionName],
    }).then(callback);
};

const IdentificationCodesListDeleteModalFooter: FC<{
    listId: string;
    connectionName: string;
    understood: boolean;
    onCancel: () => void;
}> = ({ listId, connectionName, understood, onCancel }) => {
    const intl = useIntl();

    return (
        <Modal.Footer>
            <Button
                onClick={onCancel}
                variant="secondary"
                variantSize="big"
                variantColor="hierarchy">
                {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button
                variantColor="danger"
                variantSize="big"
                disabled={!understood}
                onClick={() =>
                    deleteList(listId, connectionName, () => {
                        toast({
                            variant: 'success',
                            content: intl.formatMessage({ id: 'confirmation-delete-list' }),
                        });
                    })
                }>
                {intl.formatMessage({ id: 'action_delete' })}
            </Button>
        </Modal.Footer>
    );
};

export default IdentificationCodesListDeleteModalFooter;
