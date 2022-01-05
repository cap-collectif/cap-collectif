import { FC } from 'react';
import { useIntl } from 'react-intl';
import { Table } from '@cap-collectif/ui';

const IdentificationCodesListsTableHead: FC = () => {
    const intl = useIntl();
    return (
        <Table.Thead>
            <Table.Tr>
                <Table.Th>{intl.formatMessage({ id: 'list-name' })}</Table.Th>
                <Table.Th isNumeric>
                    {intl.formatMessage({ id: 'capco.section.metrics.participants' })}
                </Table.Th>
                <Table.Th isNumeric>
                    {intl.formatMessage({ id: 'used-codes' })}
                </Table.Th>
                <Table.Th></Table.Th>
            </Table.Tr>
        </Table.Thead>
    );
};

export default IdentificationCodesListsTableHead;
