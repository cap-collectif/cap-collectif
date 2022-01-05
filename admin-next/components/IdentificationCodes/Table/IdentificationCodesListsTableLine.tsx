import { FC } from 'react';
import { IdentificationCodesListType } from '../IdentificationCodesLists';
import { useIntl } from 'react-intl';
import { ButtonGroup, ButtonQuickAction, CapUIIcon, Table, toast } from '@cap-collectif/ui';
import IdentificationCodesListDeleteModal from '../DeleteModal/IdentificationCodesListDeleteModal';
import getFileDownloadUrl from '../FileDownload';

const IdentificationCodesListsTableLine: FC<{
    list: IdentificationCodesListType;
    connectionName: string;
}> = ({ list, connectionName }) => {
    const intl = useIntl();
    return (
        <Table.Tr rowId={list.id}>
            <Table.Td>{list.name}</Table.Td>
            <Table.Td isNumeric>{list.codesCount.toString()}</Table.Td>
            <Table.Td isNumeric>{list.alreadyUsedCount.toString()}</Table.Td>
            <Table.Td visibleOnHover>
                <ButtonGroup>
                    <ButtonQuickAction
                        onClick={() => {
                            window.open(getFileDownloadUrl(list.id), '_blank');
                            toast({
                                variant: 'success',
                                content: intl.formatMessage({
                                    id: 'downloaded-list-please-communicate',
                                }),
                            });
                        }}
                        icon={CapUIIcon.Download}
                        label={intl.formatMessage({ id: 'global.download' })}
                        variantColor="blue"
                    />
                    <IdentificationCodesListDeleteModal
                        list={list}
                        connectionName={connectionName}
                    />
                </ButtonGroup>
            </Table.Td>
        </Table.Tr>
    );
};

export default IdentificationCodesListsTableLine;
