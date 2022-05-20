import type { FC } from 'react';
import { useIntl } from 'react-intl';
import { ButtonGroup, ButtonQuickAction, CapUIIcon, Table, toast } from '@cap-collectif/ui';
import IdentificationCodesListDeleteModal from '../DeleteModal/IdentificationCodesListDeleteModal';
import getFileDownloadUrl from '../FileDownload';
import { graphql, useFragment } from 'react-relay';
import type { IdentificationCodesListsTableLine_userIdentificationCodeList$key } from '@relay/IdentificationCodesListsTableLine_userIdentificationCodeList.graphql';

const FRAGMENT = graphql`
    fragment IdentificationCodesListsTableLine_userIdentificationCodeList on UserIdentificationCodeList {
        id
        name
        codesCount
        alreadyUsedCount
        ...IdentificationCodesListDeleteModal_userIdentificationCodeList
    }
`;

type IdentificationCodesListsTableLineProps = {
    userIdentificationCodeList: IdentificationCodesListsTableLine_userIdentificationCodeList$key,
    connectionName: string,
};

const IdentificationCodesListsTableLine: FC<IdentificationCodesListsTableLineProps> = ({
    userIdentificationCodeList: userIdentificationCodeListFragment,
    connectionName,
}) => {
    const intl = useIntl();
    const userIdentificationCodeList = useFragment(FRAGMENT, userIdentificationCodeListFragment);

    return (
        <Table.Tr rowId={userIdentificationCodeList.id}>
            <Table.Td>{userIdentificationCodeList.name}</Table.Td>
            <Table.Td isNumeric>{userIdentificationCodeList.codesCount.toString()}</Table.Td>
            <Table.Td isNumeric>{userIdentificationCodeList.alreadyUsedCount.toString()}</Table.Td>
            <Table.Td visibleOnHover>
                <ButtonGroup>
                    <ButtonQuickAction
                        onClick={() => {
                            window.open(
                                getFileDownloadUrl(userIdentificationCodeList.id),
                                '_blank',
                            );
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
                        userIdentificationCodeList={userIdentificationCodeList}
                        connectionName={connectionName}
                    />
                </ButtonGroup>
            </Table.Td>
        </Table.Tr>
    );
};

export default IdentificationCodesListsTableLine;
