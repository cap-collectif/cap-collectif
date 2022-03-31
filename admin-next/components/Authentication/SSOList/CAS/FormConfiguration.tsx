import type { FC } from 'react';
import { Box, Flex, FormGuideline, FormLabel } from '@cap-collectif/ui';
import { useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { FormControl, FieldInput } from '@cap-collectif/form';
import { capitalizeFirstLetter } from '@utils/format-string';

export type FormValues = {
    name: string;
    casVersion: string;
    casServerUrl: string;
    casCertificate: string;
};

const REGEX_SERVER_URL = /^https:\/\/.*\.\w+.*\/cas$/gi;

const formName = 'form-cas-configuration';

export const casVersionOptions = [
    {
        value: 'v1',
        label: 'CAS 1.0',
    },
    {
        value: 'v2',
        label: 'CAS 2.0',
    },
    {
        value: 'v3',
        label: 'CAS 3.0',
    },
];

const FormConfiguration: FC = () => {
    const intl = useIntl();
    const { control, setValue } = useFormContext<FormValues>();

    return (
        <Flex as="form" direction="column" spacing={3} id={formName}>
            <FormControl name="casVersion" control={control} isRequired>
                <FormLabel
                    htmlFor="casVersion"
                    label={capitalizeFirstLetter(intl.formatMessage({ id: 'app-version' }))}
                />
                <FieldInput
                    type="select"
                    control={control}
                    name="casVersion"
                    id="casVersion"
                    defaultValue={control._defaultValues.casVersion}
                    options={casVersionOptions}
                    placeholder={intl.formatMessage({
                        id: 'global.form.ranking.select',
                    })}
                />
            </FormControl>
            <FormControl name="casServerUrl" control={control} isRequired>
                <FormLabel
                    htmlFor="casServerUrl"
                    label={intl.formatMessage({ id: 'server-url' })}
                />
                <FormGuideline>{intl.formatMessage({ id: 'server-url-help' })}</FormGuideline>
                <FieldInput
                    id="casServerUrl"
                    name="casServerUrl"
                    control={control}
                    type="text"
                    rules={{
                        pattern: {
                            value: REGEX_SERVER_URL,
                            message: intl.formatMessage({ id: 'source.constraints.link' }),
                        },
                    }}
                />
            </FormControl>
            <FormControl name="casCertificate" control={control} isRequired>
                <FormLabel
                    htmlFor="casCertificate"
                    label={intl.formatMessage({ id: 'server-certificate' })}
                />
                <FieldInput
                    id="casCertificate"
                    type="textarea"
                    control={control}
                    name="casCertificate"
                    placeholder={intl.formatMessage({ id: 'cas-certificate-placeholder' })}
                />
            </FormControl>
            <Box
                as="label"
                htmlFor="casCertificateFileInput"
                color="blue.500"
                style={{ textDecoration: 'underline' }}>
                {intl.formatMessage({ id: 'certificate-from-file' })}
            </Box>
            <Box
                as="input"
                id="casCertificateFileInput"
                type="file"
                display="none"
                onChange={e => {
                    const fileReader = new FileReader();
                    fileReader.onload = function () {
                        if (fileReader.result) {
                            setValue('casCertificate', fileReader.result);
                        }
                    };
                    fileReader.readAsText(e.target.files[0]);
                }}
            />
            <FormControl name="name" control={control} isRequired>
                <FormLabel htmlFor="name" label={intl.formatMessage({ id: 'button-name' })} />
                <FieldInput id="name" name="name" control={control} type="text" />
            </FormControl>
        </Flex>
    );
};

export default FormConfiguration;
