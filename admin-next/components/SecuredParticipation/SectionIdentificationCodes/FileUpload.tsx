import { DropzoneProps, useDropzone } from 'react-dropzone';
import { CapUISpotIcon, CapUISpotIconSize, SpotIcon, Text } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import type { FC } from 'react';

//todo this should be replaced as soon as the fileUploader is available in capUi
const FileUpload: FC<DropzoneProps> = ({ onDrop, ...rest }) => {
    const { getRootProps, getInputProps } = useDropzone({ onDrop });
    const intl = useIntl();

    return (
        <div className="image-uploader">
            <div className="col-sm-12 col-xs-12">
                <div
                    {...getRootProps()}
                    className="image-uploader__dropzone--fullwidth"
                    style={{
                        border: '2px dashed #e3e3e3',
                        borderRadius: '5px',
                        textAlign: 'center',
                        height: '100%',
                        width: '100%',
                    }}>
                    <div className="image-uploader__dropzone-label">
                        <SpotIcon name={CapUISpotIcon.SHEET} size={CapUISpotIconSize.Lg} m="auto" />
                        <Text color="gray.400">
                            {intl.formatMessage({ id: 'global.image_uploader.file.dropzone' })}
                        </Text>
                        <input {...getInputProps({ ...rest })} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
