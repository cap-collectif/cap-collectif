import { Button, CapUIModalSize, Heading, Modal, toast } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { FC, useState } from 'react';
import { CreateUserIdentificationCodeListMutationResponse } from '@relay/CreateUserIdentificationCodeListMutation.graphql';
import { DataType } from '../DataType';
import CreateUserIdentificationCodeListMutation from '../../../mutations/CreateUserIdentificationCodeListMutation';
import IdentificationCodesListCreationModalHeader from './IdentificationCodesListCreationModalHeader';
import IdentificationCodesListCreationModalBody from './IdentificationCodesListCreationModalBody';
import IdentificationCodesListCreationModalFooter from './IdentificationCodesListCreationModalFooter';

export const IdentificationCodesListCreationModal: FC<{
    connectionName: string;
    isFirst: boolean;
}> = ({ connectionName, isFirst }) => {
    const intl = useIntl();

    const [data, setData] = useState<DataType | undefined>(undefined);
    const [name, setName] = useState<string | undefined>(undefined);
    const [response, setResponse] = useState<
        CreateUserIdentificationCodeListMutationResponse | undefined
    >(undefined);
    const header = intl.formatMessage({
        id: response?.createUserIdentificationCodeList?.userIdentificationCodeList
            ? 'download-list'
            : 'import-list',
    });

    const onSubmit = (data: DataType, name: string, connectionName: string): void => {
        CreateUserIdentificationCodeListMutation.commit({
            input: {
                data: data.validData,
                name: name,
            },
            connections: [connectionName],
            edgeTypeName: 'UserIdentificationCodeList',
        }).then((value: CreateUserIdentificationCodeListMutationResponse): void => {
            setResponse(value);
        });
    };

    const clear = (): void => {
        setData(undefined);
        setName(undefined);
        setResponse(undefined);
    };

    return (
        <Modal
            size={CapUIModalSize.Md}
            disclosure={
                <Button>
                    {intl.formatMessage({ id: isFirst ? 'global-start' : 'create-list' })}
                </Button>
            }
            ariaLabel={header}>
            {({ hide }) => (
                <>
                    <Modal.Header>
                        <Heading>{header}</Heading>
                    </Modal.Header>
                    <IdentificationCodesListCreationModalBody
                        response={response}
                        data={data}
                        setData={setData}
                        setName={setName}
                    />
                    <IdentificationCodesListCreationModalFooter
                        response={response}
                        data={data}
                        name={name}
                        connectionName={connectionName}
                        hide={hide}
                        onSubmit={onSubmit}
                        clear={clear}
                    />
                </>
            )}
        </Modal>
    );
};

export default IdentificationCodesListCreationModal;
