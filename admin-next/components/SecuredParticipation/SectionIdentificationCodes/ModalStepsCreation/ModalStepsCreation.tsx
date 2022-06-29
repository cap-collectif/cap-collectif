import type { FC } from 'react';
import { Button, MultiStepModal, CapUIModalSize } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { useState } from 'react';
import { DataType } from '../DataType';
import { CreateUserIdentificationCodeListMutationResponse } from '@relay/CreateUserIdentificationCodeListMutation.graphql';
import ModalImportList from './ModalImportList';
import ModalDownloadList from './ModalDownloadList';

type ModalStepsCreationProps = {
    readonly connectionName: string;
    readonly isFirst?: boolean;
};

const ModalStepsCreation: FC<ModalStepsCreationProps> = ({ isFirst, connectionName }) => {
    const intl = useIntl();

    const [data, setData] = useState<DataType | null>(null);
    const [name, setName] = useState('');
    const [response, setResponse] = useState<
        CreateUserIdentificationCodeListMutationResponse | undefined
    >(undefined);

    const clear = (): void => {
        setData(null);
        setName('');
        setResponse(undefined);
    };

    return (
        <MultiStepModal
            ariaLabel={intl.formatMessage({ id: 'import-list' })}
            disclosure={
                <Button variant="primary" variantColor="primary" variantSize="small">
                    {intl.formatMessage({ id: isFirst ? 'global-start' : 'create-list' })}
                </Button>
            }
            size={CapUIModalSize.Md}
            onClose={clear}
            sx={{
                '.cap-modal__header + div': {
                    marginTop: 0,
                },
            }}>
            <ModalImportList
                connectionName={connectionName}
                isFirst={isFirst}
                name={name}
                setName={setName}
                setData={setData}
                setResponse={setResponse}
                data={data}
            />
            <ModalDownloadList
                response={response}
                codesCount={
                    response?.createUserIdentificationCodeList?.userIdentificationCodeList
                        ?.codesCount || 0
                }
            />
        </MultiStepModal>
    );
};

export default ModalStepsCreation;
