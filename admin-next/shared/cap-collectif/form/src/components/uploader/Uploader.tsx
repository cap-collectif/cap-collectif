// @ts-nocheck

import { useState, FC } from 'react';
import {
    Uploader as CapUploader,
    InfoMessage,
    FileList,
} from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import {
    handleErrors,
    handleWarning,
    UploaderError,
    UploaderWarning,
    uploadFiles,
    UploaderProps
} from './Uploader.utils';

export const Uploader: FC<UploaderProps> = ({
    onDrop,
    onDropRejected,
    uploadURI,
    multiple = false,
    maxSize = 10000000,
    value,
    onChange,
    onRemove,
    ...props
}) => {
    const intl = useIntl();
    const [error, setError] = useState<UploaderError>([]);
    const [warning, setWarning] = useState<UploaderWarning>(null);

    const wordingUploader = {
        uploaderPrompt: intl.formatMessage({ id: 'uploader-prompt' }, { count: multiple ? 2 : 1 }),
        uploaderLoadingPrompt: intl.formatMessage({ id: 'page-media-add--loading' }),
        fileDeleteLabel: intl.formatMessage({ id: 'action_delete' }),
    };

    const resetWarningAndError = () => {
        setError(null);
        setWarning(null);
    };

    return (
        <>
            <CapUploader
                wording={wordingUploader}
                onDrop={async (...args) => {
                    handleWarning(args[0], setWarning, intl, props.minResolution);

                    if (uploadURI) {
                        const filesUploaded = await uploadFiles(args[0], uploadURI);

                        if(onChange) {
                            if(multiple)onChange(filesUploaded);
                            else onChange(filesUploaded[0]);
                        }
                    }

                    if (error || warning) resetWarningAndError();
                    if (onDrop) onDrop(...args);
                }}
                value={value}
                onDropRejected={(filesRejected, event) => {
                    if (maxSize || props.format) {
                        handleErrors(filesRejected, setError, multiple, intl, {
                            maxSize,
                            format: props.format,
                        });
                    }

                    if (onDropRejected) onDropRejected(filesRejected, event);
                }}
                multiple={multiple}
                maxSize={maxSize}
                onRemove={(file) => {
                    if(onChange) onChange(null);
                    if(onRemove) onRemove(file);
                }}
                {...props}
            />

            {warning && (
                <InfoMessage variant="warning">
                    <InfoMessage.Title>{warning}</InfoMessage.Title>
                </InfoMessage>
            )}

            {Array.isArray(error) && error.length > 0 && (
                <InfoMessage variant="danger">
                    <InfoMessage.Title>
                        {intl.formatMessage({ id: 'uploader.rejected.list.title' })}
                    </InfoMessage.Title>
                    {error.map((error, idx) => (
                        <InfoMessage.Content color="red.900" key={`error-${idx}`}>
                            {error}
                        </InfoMessage.Content>
                    ))}
                </InfoMessage>
            )}

            {!Array.isArray(error) && error && (
                <InfoMessage variant="danger">
                    <InfoMessage.Title>{error}</InfoMessage.Title>
                </InfoMessage>
            )}

            {multiple && Array.isArray(value) && value.length > 0 && (
                <FileList
                    files={value}
                    deleteFileLabel={intl.formatMessage({ id: 'action_delete' })}
                    onRemove={fileDeleted => {
                        if(onChange && Array.isArray(value)){
                            const filesUpdated = value.filter(file => file.id !== fileDeleted.id);
                            onChange(filesUpdated);
                        }
                    }}
                />
            )}
        </>
    );
};

export default Uploader;
