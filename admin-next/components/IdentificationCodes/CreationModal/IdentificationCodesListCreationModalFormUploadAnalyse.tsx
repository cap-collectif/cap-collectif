import { DataType } from '../DataType';
import { FC } from 'react';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import { Box, InfoMessage } from '@cap-collectif/ui';
import { HelpUrl } from '../HelpButton';

type IdentificationCodesListCreationModalFormUploadAnalyseProps = {
    data: DataType;
};

const IdentificationCodesListCreationModalFormUploadAnalyseValid: FC<
    IdentificationCodesListCreationModalFormUploadAnalyseProps
> = ({ data }) => {
    const intl = useIntl();

    return (
        <InfoMessage variant="success" mt={2}>
            <InfoMessage.Title withIcon>
                {intl.formatMessage(
                    { id: 'num-entrants-identified' },
                    {
                        count: data.validData.length,
                    },
                )}
            </InfoMessage.Title>
        </InfoMessage>
    );
};

const IdentificationCodesListCreationModalFormUploadAnalyseInvalid: FC<
    IdentificationCodesListCreationModalFormUploadAnalyseProps
> = ({ data }) => {
    return (
        <InfoMessage variant="danger" mt={2}>
            <InfoMessage.Title withIcon>
                <FormattedHTMLMessage
                    id="csv-bad-lines-error"
                    values={{
                        count: data.invalidLines.length,
                        lines:
                            data.invalidLines.length > 1
                                ? data.invalidLines.slice(0, -1).toString()
                                : data.invalidLines.toString(),
                        last: data.invalidLines.pop(),
                        url: HelpUrl,
                    }}
                />
            </InfoMessage.Title>
        </InfoMessage>
    );
};

const IdentificationCodesListCreationModalFormUploadAnalyseDuplicate: FC<
    IdentificationCodesListCreationModalFormUploadAnalyseProps
> = ({ data }) => {
    const intl = useIntl();

    return (
        <InfoMessage variant="warning" mt={2}>
            <InfoMessage.Title withIcon>
                {intl.formatMessage(
                    { id: 'duplicate-lines' },
                    {
                        count: data.duplicateLines.length,
                        lines:
                            data.duplicateLines.length > 1
                                ? data.duplicateLines.slice(0, -1).toString()
                                : data.duplicateLines.toString(),
                        last: data.invalidLines.pop(),
                    },
                )}
            </InfoMessage.Title>
        </InfoMessage>
    );
};

const IdentificationCodesListCreationModalFormUploadAnalyseEmpty: FC = () => {
    const intl = useIntl();

    return (
        <InfoMessage variant="danger" mt={2}>
            <InfoMessage.Title withIcon>
                {intl.formatMessage(
                    { id: 'num-entrants-identified' },
                    {
                        count: 0,
                    },
                )}
            </InfoMessage.Title>
        </InfoMessage>
    );
};

const IdentificationCodesListCreationModalFormUploadAnalyseNoValid: FC = () => {
    const intl = useIntl();

    return (
        <InfoMessage variant="danger" mt={2}>
            <InfoMessage.Title>{intl.formatMessage({ id: 'file-not-imported' })}</InfoMessage.Title>
            <InfoMessage.Content>
                {intl.formatMessage({ id: 'check-your-csv' })}
            </InfoMessage.Content>
        </InfoMessage>
    );
};

const IdentificationCodesListCreationModalFormUploadAnalyse: FC<
    IdentificationCodesListCreationModalFormUploadAnalyseProps
> = ({ data }) => {
    return (
        <>
            {data.validData.length > 0 ? (
                <>
                    <IdentificationCodesListCreationModalFormUploadAnalyseValid data={data} />
                    {data.invalidLines.length > 0 && (
                        <IdentificationCodesListCreationModalFormUploadAnalyseInvalid data={data} />
                    )}
                    {data.duplicateLines.length > 0 && (
                        <IdentificationCodesListCreationModalFormUploadAnalyseDuplicate
                            data={data}
                        />
                    )}
                </>
            ) : (
                <>
                    {data.invalidLines.length > 0 ? (
                        <IdentificationCodesListCreationModalFormUploadAnalyseNoValid />
                    ) : (
                        <IdentificationCodesListCreationModalFormUploadAnalyseEmpty />
                    )}
                </>
            )}
        </>
    );
};

export default IdentificationCodesListCreationModalFormUploadAnalyse;
