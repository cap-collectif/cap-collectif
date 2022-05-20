import type { FC } from 'react';
import { Button, MultiStepModal, CapUIModalSize, toast, Heading } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { useState } from 'react';
import { DataType } from '../DataType';
import {
    CreateUserIdentificationCodeListMutationResponse
} from '@relay/CreateUserIdentificationCodeListMutation.graphql';
import CreateUserIdentificationCodeListMutation from '@mutations/CreateUserIdentificationCodeListMutation';
import ModalImportList from './ModalImportList';
import ModalDownloadList from './ModalDownloadList';
import getFileDownloadUrl from '../FileDownload';

const DEFAULT_CODE_LENGTH = 8;

type ModalStepsCreationProps = {
    readonly connectionName: string,
    readonly isFirst?: boolean,
}

const onSubmit = (
    data: DataType,
    name: string,
    connectionName: string,
    setResponse: (data: CreateUserIdentificationCodeListMutationResponse) => void,
    isFirst?: boolean
) => {
    return CreateUserIdentificationCodeListMutation.commit({
        input: {
            data: data.validData,
            name: name,
            codeLength: DEFAULT_CODE_LENGTH,
        },
        connections: [connectionName],
    }).then((value: CreateUserIdentificationCodeListMutationResponse) => {
        /* There is no second step when creating for the first time */
        if(!isFirst) setResponse(value);
    });
};

const ModalStepsCreation: FC<ModalStepsCreationProps> = ({ isFirst, connectionName }) => {
    const intl = useIntl();

    const [data, setData] = useState<DataType | null>(null);
    const [name, setName] = useState('');
    const [response, setResponse] = useState<
        CreateUserIdentificationCodeListMutationResponse | undefined,
        >(undefined);

    const clear = (): void => {
        setData(null);
        setName('');
        setResponse(undefined);
    };

    return <MultiStepModal
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
                marginTop: 0
            }
        }}>
        {({ hide, goToNextStep, currentStep }) => (
            <>
                <MultiStepModal.Header>
                    {currentStep === 1 && (
                        <Heading>
                            {intl.formatMessage({ id: 'download-list' })}
                        </Heading>
                    )}
                </MultiStepModal.Header>
                <MultiStepModal.ProgressBar />

                <MultiStepModal.Body>
                    <ModalImportList
                        id="import-list"
                        label={intl.formatMessage({ id: 'import-list' })}
                        setName={setName}
                        setData={setData}
                        data={data}
                        validationLabel={intl.formatMessage({ id: 'code-generate' })} />
                    <ModalDownloadList
                        id="download-list"
                        validationLabel={intl.formatMessage({ id: 'global.download' })}
                        codesCount={response?.createUserIdentificationCodeList?.userIdentificationCodeList?.codesCount || 0}
                    />
                </MultiStepModal.Body>

                <MultiStepModal.Footer>
                    {currentStep === 0 && <MultiStepModal.Footer.BackButton
                        wording={{
                            firstStepWording: intl.formatMessage({ id: "cancel"}),
                            otherStepsWording: intl.formatMessage({ id: "cancel"})
                        }}
                    />}
                    <MultiStepModal.Footer.ContinueButton disabled={!name && !data} onClick={async () => {
                        if(data) {
                            await onSubmit(data, name, connectionName, setResponse, isFirst)
                            if(!isFirst) goToNextStep()
                        }
                    }} />
                    <MultiStepModal.Footer.ValidationButton onClick={() => {
                        window.open(
                            getFileDownloadUrl(
                                response?.createUserIdentificationCodeList?.userIdentificationCodeList?.id || '',
                            ),
                            '_blank',
                        );
                        toast({
                            variant: 'success',
                            content: intl.formatMessage({ id: 'downloaded-list-please-communicate' }),
                        });
                        hide();
                    }} />
                </MultiStepModal.Footer>
            </>
        )}
    </MultiStepModal>;
}

export default ModalStepsCreation;