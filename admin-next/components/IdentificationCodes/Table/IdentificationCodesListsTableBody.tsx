import { FC } from 'react';
import { Table } from '@cap-collectif/ui';
import { IdentificationCodesListType } from '../IdentificationCodesLists';
import IdentificationCodesListsTableLine from './IdentificationCodesListsTableLine';

const IdentificationCodesListsTableBody: FC<{
    lists: Array<{ node: IdentificationCodesListType }>;
    connectionName: string;
}> = ({ lists, connectionName }) => {
    return (
        <Table.Tbody>
            {lists
                ?.filter(Boolean)
                .map(edge => edge && edge.node)
                ?.filter(Boolean)
                .map(node => (
                    <IdentificationCodesListsTableLine
                        key={node.id}
                        list={node}
                        connectionName={connectionName}
                    />
                ))}
        </Table.Tbody>
    );
};

export default IdentificationCodesListsTableBody;
