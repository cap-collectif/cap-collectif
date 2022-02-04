import type { FC } from 'react';
import * as React from 'react';
import { CapUIFontWeight, Flex, FormLabel, Text } from '@cap-collectif/ui';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { FranceConnectAllowedData } from '@relay/ModalFranceConnectConfiguration_ssoConfiguration.graphql';
import { FormControl, FieldInput } from '@cap-collectif/form';

export type FormValues = {
    environment: boolean,
    clientId: string,
    secret: string,
    redirectUri: string,
    logoutUrl: string,
    given_name: boolean,
    family_name: boolean,
    birthdate: boolean,
    birthplace: boolean,
    birthcountry: boolean,
    gender: boolean,
    email: boolean,
    preferred_username: boolean,
};

type OptionalField = {
    label: string,
    value: FranceConnectAllowedData,
};

const OPTIONAL_FIELDS: OptionalField[] = [
    {
        label: 'birth-country',
        value: 'birthcountry',
    },
    {
        label: 'form.label_date_of_birth',
        value: 'birthdate',
    },
    {
        label: 'birthPlace',
        value: 'birthplace',
    },
    {
        label: 'filter.label_email',
        value: 'email',
    },
    {
        label: 'form.label_lastname',
        value: 'family_name',
    },
    {
        label: 'form.label_gender',
        value: 'gender',
    },
    {
        label: 'form.label_firstname',
        value: 'given_name',
    },
    {
        label: 'list.label_username',
        value: 'preferred_username',
    },
];

const formName = 'form-france-connect-configuration';

const FormConfiguration: FC = () => {
    const intl = useIntl();
    const { control } = useFormContext<FormValues>();

    return (
        <Flex as="form" direction="column" spacing={3} id={formName}>
            <Text color="gray.700" fontSize={3}>
                <FormattedHTMLMessage id="edit-facebook-authentication-method-create-app" />
            </Text>

            <FormControl name="clientId" control={control} isRequired>
                <FormLabel htmlFor="clientId" label={intl.formatMessage({ id: 'client-id' })} />
                <FieldInput
                    id="clientId"
                    name="clientId"
                    control={control}
                    type="text"
                    minLength={2}
                />
            </FormControl>

            <FormControl name="secret" control={control} isRequired>
                <FormLabel htmlFor="secret" label={intl.formatMessage({ id: 'secret' })} />
                <FieldInput id="secret" name="secret" control={control} type="text" minLength={2} />
            </FormControl>

            <FormControl name="redirectUri" control={control} isRequired isDisabled>
                <FormLabel
                    htmlFor="redirectUri"
                    label={intl.formatMessage({ id: 'callback-url' })}
                />
                <FieldInput id="redirectUri" name="redirectUri" control={control} type="text" />
            </FormControl>

            <FormControl name="logoutUrl" control={control} isRequired isDisabled>
                <FormLabel htmlFor="logoutUrl" label={intl.formatMessage({ id: 'logout-url' })} />
                <FieldInput id="logoutUrl" name="logoutUrl" control={control} type="text" />
            </FormControl>

            <FormControl name="logoutUrl" control={control} isRequired isDisabled>
                <FormLabel htmlFor="environment" label={intl.formatMessage({ id: 'logout-url' })} />
                <FieldInput id="environment" name="environment" control={control} type="checkbox">
                    {intl.formatMessage({
                        id: 'environment-france-connect',
                    })}
                </FieldInput>
            </FormControl>

            <Flex direction="column" spacing={2}>
                <Text color="gray.900" fontSize={2} fontWeight={CapUIFontWeight.Semibold}>
                    {intl.formatMessage({ id: 'fc-allowed-fields' })}
                </Text>

                <Flex direction="column" spacing={1}>
                    {OPTIONAL_FIELDS.map(optionalField => (
                        <Flex
                            direction="row"
                            align="flex-start"
                            spacing={2}
                            key={optionalField.value}>
                            <FieldInput
                                type="switch"
                                control={control}
                                key={optionalField.value}
                                name={optionalField.value}
                                id={optionalField.value}>
                                {intl.formatMessage({ id: optionalField.label })}
                            </FieldInput>
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </Flex>
    );
};

export default FormConfiguration;
