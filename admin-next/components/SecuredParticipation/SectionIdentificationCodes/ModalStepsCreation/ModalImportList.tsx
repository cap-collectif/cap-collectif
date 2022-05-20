import type { FC, ChangeEvent } from 'react';
import type { Step } from '@cap-collectif/ui';
import {
    Flex,
    FormControl,
    FormGuideline,
    FormLabel,
    Input,
    Text,
    Uploader,
} from '@cap-collectif/ui';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import { extractAndSetData } from '../FileAnalyse';
import IdentificationCodesListCreationModalFormUploadAnalyse from './IdentificationCodesListCreationModalFormUploadAnalyse';
import { CSVModelName, CSVModelURI } from './CSVModel';
import type { DataType } from '../DataType';

type ModalImportListProps = Step & {
    setName: (name: string) => void
    setData: (data: DataType) => void
    data: DataType | null
};

const ModalImportList: FC<ModalImportListProps> = ({ setData, setName, data }) => {
    const intl = useIntl();

    return (
        <Flex as="form" direction="column" width="100%" id="create-code-identification-list">
            <Text
                color="gray.400"
                mb={4}
                sx={{ '& a': { color: 'blue.500', textDecoration: 'underline' } }}>
                <FormattedHTMLMessage
                    id="identification-code-import-users-help"
                    values={{
                        uri: CSVModelURI,
                        fileName: CSVModelName,
                    }}
                />
            </Text>

            <FormControl mb={4}>
                <FormLabel label={intl.formatMessage({ id: 'list-name' })} />
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={intl.formatMessage({ id: 'choose-name' })}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
            </FormControl>

            <FormControl mt={1} mb={2}>
                <FormLabel label={intl.formatMessage({ id: 'import-your-list' })} />
                <FormGuideline>
                    {intl.formatMessage({ id: 'uploader.banner.format' }) +
                        ' csv. ' +
                        intl.formatMessage({ id: 'uploader.banner.weight' }) +
                        ' 10mo.'}
                </FormGuideline>
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
                />
            </FormControl>
            {data && <IdentificationCodesListCreationModalFormUploadAnalyse data={data} />}
        </Flex>
    );
};

export default ModalImportList;
