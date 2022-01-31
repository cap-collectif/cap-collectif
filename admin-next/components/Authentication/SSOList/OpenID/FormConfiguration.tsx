import type { FC } from 'react';
import { Flex } from '@cap-collectif/ui';
import FieldInput from '../../../Form/FieldInput';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { REGEX_URL } from '~/services/Validator';

export type FormValues = {
    name: string,
    authorizationUrl: string,
    accessTokenUrl: string,
    userInfoUrl: string,
    logoutUrl: string | null,
    clientId: string,
    secret: string,
    profileUrl: string | null,
    redirectUri?: string,
};

const formName = 'form-openId-configuration';

const FormConfiguration: FC = () => {
    const intl = useIntl();
    const { control } = useFormContext<FormValues>();

    return (
        <Flex as="form" direction="column" spacing={3} id={formName}>
            <FieldInput
                type="text"
                id="name"
                name="name"
                required
                label={intl.formatMessage({ id: 'global.name' })}
                control={control}
                minLength={2}
            />

            <FieldInput
                type="text"
                id="authorizationUrl"
                name="authorizationUrl"
                required
                label={intl.formatMessage({ id: 'authorization-URL' })}
                control={control}
                pattern={{
                    value: REGEX_URL,
                    message: intl.formatMessage({ id: 'source.constraints.link' }),
                }}
            />

            <FieldInput
                type="text"
                id="accessTokenUrl"
                name="accessTokenUrl"
                required
                label={intl.formatMessage({ id: 'access-token-URL' })}
                control={control}
                pattern={{
                    value: REGEX_URL,
                    message: intl.formatMessage({ id: 'source.constraints.link' }),
                }}
            />

            <FieldInput
                type="text"
                id="userInfoUrl"
                name="userInfoUrl"
                required
                label={intl.formatMessage({ id: 'user-information-url' })}
                control={control}
                pattern={{
                    value: REGEX_URL,
                    message: intl.formatMessage({ id: 'source.constraints.link' }),
                }}
            />

            <FieldInput
                type="text"
                id="logoutUrl"
                name="logoutUrl"
                label={intl.formatMessage({ id: 'access-disconnection-url' })}
                control={control}
                pattern={{
                    value: REGEX_URL,
                    message: intl.formatMessage({ id: 'source.constraints.link' }),
                }}
            />

            <FieldInput
                type="text"
                id="clientId"
                name="clientId"
                required
                label={intl.formatMessage({ id: 'client-id' })}
                minLength={2}
                control={control}
            />

            <FieldInput
                type="text"
                id="secret"
                name="secret"
                label={intl.formatMessage({ id: 'secret' })}
                required
                control={control}
                minLength={2}
            />

            <FieldInput
                type="text"
                id="profileUrl"
                name="profileUrl"
                label={intl.formatMessage({ id: 'url-user-profile-sso' })}
                control={control}
                pattern={{
                    value: REGEX_URL,
                    message: intl.formatMessage({ id: 'source.constraints.link' }),
                }}
            />

            <FieldInput
                disabled
                type="text"
                id="redirectUri"
                name="redirectUri"
                label={intl.formatMessage({ id: 'sso-link' })}
                control={control}
            />
        </Flex>
    );
};

export default FormConfiguration;
