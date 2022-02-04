import type { FC } from 'react';
import { Flex, FormLabel } from '@cap-collectif/ui';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { FormControl, FieldInput, REGEX_URL } from '@cap-collectif/form';

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
            <FormControl name="name" control={control} isRequired>
                <FormLabel htmlFor="name" label={intl.formatMessage({ id: 'global.name' })} />
                <FieldInput id="name" name="name" control={control} type="text" minLength={2} />
            </FormControl>

            <FormControl name="authorizationUrl" control={control} isRequired>
                <FormLabel
                    htmlFor="authorizationUrl"
                    label={intl.formatMessage({ id: 'authorization-URL' })}
                />
                <FieldInput
                    id="authorizationUrl"
                    name="authorizationUrl"
                    control={control}
                    type="text"
                    rules={{
                        pattern: {
                            value: REGEX_URL,
                            message: intl.formatMessage({ id: 'source.constraints.link' }),
                        },
                    }}
                />
            </FormControl>

            <FormControl name="accessTokenUrl" control={control} isRequired>
                <FormLabel
                    htmlFor="accessTokenUrl"
                    label={intl.formatMessage({ id: 'access-token-URL' })}
                />
                <FieldInput
                    id="accessTokenUrl"
                    name="accessTokenUrl"
                    control={control}
                    type="text"
                    rules={{
                        pattern: {
                            value: REGEX_URL,
                            message: intl.formatMessage({ id: 'source.constraints.link' }),
                        },
                    }}
                />
            </FormControl>

            <FormControl name="userInfoUrl" control={control} isRequired>
                <FormLabel
                    htmlFor="userInfoUrl"
                    label={intl.formatMessage({ id: 'user-information-url' })}
                />
                <FieldInput
                    id="userInfoUrl"
                    name="userInfoUrl"
                    control={control}
                    type="text"
                    rules={{
                        pattern: {
                            value: REGEX_URL,
                            message: intl.formatMessage({ id: 'source.constraints.link' }),
                        },
                    }}
                />
            </FormControl>

            <FormControl name="logoutUrl" control={control} isRequired>
                <FormLabel
                    htmlFor="logoutUrl"
                    label={intl.formatMessage({ id: 'access-disconnection-url' })}
                />
                <FieldInput
                    id="logoutUrl"
                    name="logoutUrl"
                    control={control}
                    type="text"
                    rules={{
                        pattern: {
                            value: REGEX_URL,
                            message: intl.formatMessage({ id: 'source.constraints.link' }),
                        },
                    }}
                />
            </FormControl>

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

            <FormControl name="profileUrl" control={control}>
                <FormLabel
                    htmlFor="profileUrl"
                    label={intl.formatMessage({ id: 'url-user-profile-sso' })}
                />
                <FieldInput
                    id="profileUrl"
                    name="profileUrl"
                    control={control}
                    type="text"
                    rules={{
                        pattern: {
                            value: REGEX_URL,
                            message: intl.formatMessage({ id: 'source.constraints.link' }),
                        },
                    }}
                />
            </FormControl>

            <FormControl name="profileUrl" control={control} isDisabled>
                <FormLabel htmlFor="redirectUri" label={intl.formatMessage({ id: 'sso-link' })} />
                <FieldInput id="redirectUri" name="redirectUri" control={control} type="text" />
            </FormControl>
        </Flex>
    );
};

export default FormConfiguration;
