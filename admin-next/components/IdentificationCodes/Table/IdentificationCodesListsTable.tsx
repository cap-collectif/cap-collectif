import { FC } from 'react';
import { Table } from '@cap-collectif/ui';
import { IdentificationCodesListType } from '../IdentificationCodesLists';
import IdentificationCodesListsTableHead from './IdentificationCodesListsTableHead';
import IdentificationCodesListsTableBody from './IdentificationCodesListsTableBody';

const IdentificationCodesListsTable: FC<{
    lists: Array<{ node: IdentificationCodesListType }>;
    connectionName: string;
}> = ({ lists, connectionName }) => {
    return (
        <Table emptyMessage={''}>
            <IdentificationCodesListsTableHead />
            <IdentificationCodesListsTableBody lists={lists} connectionName={connectionName} />
        </Table>
    );
};

export default IdentificationCodesListsTable;
