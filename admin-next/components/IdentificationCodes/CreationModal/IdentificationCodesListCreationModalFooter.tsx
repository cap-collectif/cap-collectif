import { CreateUserIdentificationCodeListMutationResponse } from '@relay/CreateUserIdentificationCodeListMutation.graphql';
import { FC, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Modal, toast } from '@cap-collectif/ui';
import { DataType } from '../DataType';
import getFileDownloadUrl from '../FileDownload';
import { isBlank } from '../FileAnalyse';

type IdentificationCodesListCreationModalFooterAfterResponseProps = {
    response: CreateUserIdentificationCodeListMutationResponse;
    hide: () => void;
};

type IdentificationCodesListCreationModalFooterBeforeResponseProps = {
    data: DataType;
    name: string;
    connectionName: string;
    hide: () => void;
    clear: () => void;
    onSubmit: (data: DataType, name: string, connectionName: string) => void;
};

type IdentificationCodesListCreationModalFooterProps =
    IdentificationCodesListCreationModalFooterBeforeResponseProps &
        IdentificationCodesListCreationModalFooterAfterResponseProps;

const IdentificationCodesListCreationModalFooterAfterResponse: FC<
    IdentificationCodesListCreationModalFooterAfterResponseProps
> = ({ response, hide }) => {
    const intl = useIntl();

    return (
        <Button
            variantSize="big"
            onClick={() => {
                window.open(
                    getFileDownloadUrl(
                        response.createUserIdentificationCodeList?.userIdentificationCodeList.id,
                    ),
                    '_blank',
                );
                toast({
                    variant: 'success',
                    content: intl.formatMessage({ id: 'downloaded-list-please-communicate' }),
                });
                hide();
            }}>
            {intl.formatMessage({ id: 'global.download' })}
        </Button>
    );
};

const IdentificationCodesListCreationModalFooterBeforeResponse: FC<
    IdentificationCodesListCreationModalFooterBeforeResponseProps
> = ({ data, name, connectionName, hide, clear, onSubmit }) => {
    const intl = useIntl();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    return (
        <>
            <Button
                variant="secondary"
                variantSize="big"
                variantColor="hierarchy"
                onClick={() => {
                    hide();
                    clear();
                }}>
                {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button
                variant="secondary"
                variantSize="big"
                isLoading={isLoading}
                disabled={typeof data !== 'object' || typeof name !== 'string' || isBlank(name)}
                onClick={() => {
                    setIsLoading(true);
                    onSubmit(data, name, connectionName);
                }}>
                {intl.formatMessage({ id: 'code-generate' })}
            </Button>
        </>
    );
};

const IdentificationCodesListCreationModalFooter: FC<
    IdentificationCodesListCreationModalFooterProps
> = ({ response, data, name, connectionName, hide, clear, onSubmit }) => {
    return (
        <Modal.Footer>
            {response?.createUserIdentificationCodeList?.userIdentificationCodeList ? (
                <IdentificationCodesListCreationModalFooterAfterResponse
                    response={response}
                    hide={hide}
                />
            ) : (
                <IdentificationCodesListCreationModalFooterBeforeResponse
                    data={data}
                    name={name}
                    connectionName={connectionName}
                    hide={hide}
                    clear={clear}
                    onSubmit={onSubmit}
                />
            )}
        </Modal.Footer>
    );
};

export default IdentificationCodesListCreationModalFooter;
