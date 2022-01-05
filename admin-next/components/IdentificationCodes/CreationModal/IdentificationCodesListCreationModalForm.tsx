import { DataType } from '../DataType';
import { FC, FormEvent } from 'react';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import { Flex, FormControl, FormLabel, Input, Text, Uploader } from '@cap-collectif/ui';
import { extractAndSetData } from '../FileAnalyse';
import IdentificationCodesListCreationModalFormUploadAnalyse from './IdentificationCodesListCreationModalFormUploadAnalyse';
import { CSVModelName, CSVModelURI } from './CSVModel';

const IdentificationCodesListCreationModalForm: FC<{
    data: DataType | undefined;
    setData: (data: DataType) => void;
    setName: (name: string) => void;
}> = ({ data, setData, setName }) => {
    const intl = useIntl();

    return (
        <Flex as="form" direction="column" width="100%" id="create-code-identification-list">
            <Text
                color="gray.400"
                mb={4}
                sx={{ '& a': { color: 'blue.500', textDecoration: 'underline' } }}>
                <FormattedHTMLMessage
                    id={'identification-code-import-users-help'}
                    values={{
                        uri: CSVModelURI,
                        fileName: CSVModelName,
                    }}
                />
            </Text>
            <FormControl mb={4}>
                <FormLabel label={intl.formatMessage({ id: 'list-name' })} />
                <Input
                    required
                    id="name"
                    name="name"
                    type="text"
                    placeholder={intl.formatMessage({ id: 'choose-name' })}
                    onChange={(e: FormEvent) => {
                        setName(e.target.value);
                    }}
                />
            </FormControl>
            <Text mt={1} fontSize={2}>
                {intl.formatMessage({ id: 'import-your-list' })}
            </Text>
            <FormControl mt={1} mb={2}>
                <FormLabel
                    label={
                        intl.formatMessage({ id: 'uploader.banner.format' }) +
                        ' csv. ' +
                        intl.formatMessage({ id: 'uploader.banner.weight' }) +
                        ' 10mo.'
                    }
                />
                <Uploader
                    onDrop={(acceptedFiles: File[]) => {
                        extractAndSetData(acceptedFiles[0], data => {
                            setData(data);
                        });
                    }}
                    wording={{
                        fileDeleteLabel: intl.formatMessage({ id: 'admin.global.delete' }),
                        uploaderPrompt: intl.formatMessage(
                            { id: 'uploader-prompt' },
                            { count: 1, fileType: 'csv' },
                        ),
                        uploaderLoadingPrompt: intl.formatMessage({
                            id: 'page-media-add--loading',
                        }),
                    }}
                    isInvalid={typeof data !== 'object'}
                    isRequired
                />
            </FormControl>
            {data && <IdentificationCodesListCreationModalFormUploadAnalyse data={data} />}
        </Flex>
    );
};

export default IdentificationCodesListCreationModalForm;
