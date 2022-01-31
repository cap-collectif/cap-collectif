import type { FC } from 'react';
import * as React from 'react';
import { CapUIFontWeight, Flex, FormLabel, Text } from '@cap-collectif/ui';
import FieldInput from '../../../Form/FieldInput';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import {
    FranceConnectAllowedData,
    ModalFranceConnectConfiguration_ssoConfiguration,
} from '@relay/ModalFranceConnectConfiguration_ssoConfiguration.graphql';

type FormConfigurationProps = {
    readonly optionalFields: ModalFranceConnectConfiguration_ssoConfiguration['allowedData'],
};

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
    value: FranceConnectAllowedData
}

const OPTIONAL_FIELDS: OptionalField[] = [
    {
        label: 'birth-country',
        value: 'birthcountry'
    },
    {
        label: 'form.label_date_of_birth',
        value: 'birthdate'
    },
    {
        label: 'birthPlace',
        value: 'birthplace'
    },
    {
        label: 'filter.label_email',
        value: 'email'
    },
    {
        label: 'form.label_lastname',
        value: 'family_name'
    },
    {
        label: 'form.label_gender',
        value: 'gender'
    },
    {
        label: 'form.label_firstname',
        value: 'given_name'
    },
    {
        label: 'list.label_username',
        value: 'preferred_username'
    },
]

const formName = 'form-france-connect-configuration';

const FormConfiguration: FC<FormConfigurationProps> = ({ optionalFields }) => {
    const intl = useIntl();
    const { control } = useFormContext<FormValues>();

    return (
        <Flex as="form" direction="column" spacing={3} id={formName}>
            <Text color="gray.700" fontSize={3}>
                <FormattedHTMLMessage id="edit-facebook-authentication-method-create-app" />
            </Text>

            <FieldInput
                type="text"
                id="clientId"
                name="clientId"
                required
                label={intl.formatMessage({ id: 'client-id' })}
                control={control}
                minLength={2}
            />

            <FieldInput
                type="text"
                id="secret"
                name="secret"
                required
                label={intl.formatMessage({
                    id: 'secret',
                })}
                control={control}
                minLength={2}
            />

            <FieldInput
                type="text"
                id="redirectUri"
                name="redirectUri"
                disabled
                required
                label={intl.formatMessage({
                    id: 'callback-url',
                })}
                control={control}
            />

            <FieldInput
                type="text"
                id="logoutUrl"
                name="logoutUrl"
                disabled
                required
                label={intl.formatMessage({
                    id: 'logout-url',
                })}
                control={control}
            />

            <FieldInput
                type="checkbox"
                id="environment"
                name="environment"
                control={control}
                labelOnElement={intl.formatMessage({
                    id: 'environment-france-connect',
                })}
            />

            <Flex direction="column" spacing={2}>
                <Text color="gray.900" fontSize={2} fontWeight={CapUIFontWeight.Semibold}>
                    {intl.formatMessage({ id: 'fc-allowed-fields' })}
                </Text>

                <Flex direction="column" spacing={1}>
                    {OPTIONAL_FIELDS.map(optionalField => (
                        <Flex direction="row" align="flex-start" spacing={2} key={optionalField.value}>
                            <FieldInput
                                type="switch"
                                control={control}
                                key={optionalField.value}
                                name={optionalField.value}
                                id={optionalField.value}
                            />
                            <FormLabel htmlFor={optionalField.value} label={intl.formatMessage({ id: optionalField.label })} />
                        </Flex>
                    ))}
                </Flex>
            </Flex>
        </Flex>
    );
};

export default FormConfiguration;
