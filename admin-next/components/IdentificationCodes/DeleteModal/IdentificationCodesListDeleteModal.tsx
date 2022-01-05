import { FC, useState } from 'react';
import { ButtonQuickAction, CapUIIcon, CapUIModalSize, Modal } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { IdentificationCodesListType } from '../IdentificationCodesLists';
import { useLazyLoadQuery } from 'react-relay';
import IdentificationCodesListDeleteModalBody from './IdentificationCodesListDeleteModalBody';
import IdentificationCodesListDeleteModalHeader from './IdentificationCodesListDeleteModalHeader';
import IdentificationCodesListDeleteModalFooter from './IdentificationCodesListDeleteModalFooter';
import GetProjectNamesUsingCodes, {
    GetProjectNamesUsingCodesQuery,
} from './GetProjectNamesUsingCodes';

const IdentificationCodesListDeleteModal: FC<{
    list: IdentificationCodesListType;
    connectionName: string;
}> = ({ list, connectionName }) => {
    const intl = useIntl();
    const [understood, setUnderstood] = useState<boolean>(false);
    const projectsUsingCodes = GetProjectNamesUsingCodes(
        useLazyLoadQuery(GetProjectNamesUsingCodesQuery, {}),
    );

    const clear = (): void => {
        setUnderstood(false);
    };

    return (
        <Modal
            size={CapUIModalSize.Md}
            ariaLabel={intl.formatMessage(
                { id: 'title-delete-mailing-list-confirmation' },
                { num: 1 },
            )}
            disclosure={
                <ButtonQuickAction
                    icon={CapUIIcon.Trash}
                    label={intl.formatMessage({ id: 'action_delete' })}
                    variantColor="red"
                />
            }>
            {({ hide }) => (
                <>
                    <IdentificationCodesListDeleteModalHeader />
                    <IdentificationCodesListDeleteModalBody
                        projectsUsingCodes={projectsUsingCodes}
                        listName={list.name}
                        understood={understood}
                        setUnderstood={setUnderstood}
                    />
                    <IdentificationCodesListDeleteModalFooter
                        listId={list.id}
                        connectionName={connectionName}
                        understood={understood}
                        onCancel={() => {
                            hide();
                            clear();
                        }}
                    />
                </>
            )}
        </Modal>
    );
};

export default IdentificationCodesListDeleteModal;
