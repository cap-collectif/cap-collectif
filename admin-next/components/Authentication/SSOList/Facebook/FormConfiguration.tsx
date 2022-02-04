import type { FC } from 'react';
import { Flex, FormLabel, Text } from '@cap-collectif/ui';
import * as React from 'react';
import { useIntl, FormattedHTMLMessage } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { FormControl, FieldInput } from '@cap-collectif/form';

export type FormValues = {
    clientId: string,
    secret: string,
};

const formName = 'form-facebook-configuration';

const FormConfiguration: FC = () => {
    const intl = useIntl();
    const { control } = useFormContext<FormValues>();

    return (
        <Flex as="form" direction="column" spacing={3} id={formName}>
            <Text color="gray.700" fontSize={3}>
                <FormattedHTMLMessage id="edit-facebook-authentication-method-create-app" />
            </Text>

            <FormControl name="clientId" control={control} isRequired>
                <FormLabel htmlFor="clientId" label={intl.formatMessage({ id: 'App-ID' })} />
                <FieldInput
                    id="clientId"
                    name="clientId"
                    control={control}
                    type="text"
                    placeholder="ex : 1714596595426186"
                    rules={{
                        pattern: {
                            value: /^\d+$/,
                            message: intl.formatMessage({
                                id: 'facebook-app-id-must-be-16-digits',
                            }),
                        },
                    }}
                />
            </FormControl>

            <FormControl name="secret" control={control} isRequired>
                <FormLabel htmlFor="secret" label={intl.formatMessage({ id: 'App-secret' })} />
                <FieldInput
                    id="secret"
                    name="secret"
                    control={control}
                    type="password"
                    placeholder="ex : fe7bXXXXXXXXXXXXXXXXXXXXXXXX03xx"
                    rules={{
                        validate: {
                            equalTo: value =>
                                value.length !== 32 &&
                                intl.formatMessage({ id: 'facebook-app-secret-must-be-32-char' }),
                        },
                    }}
                />
            </FormControl>

            <FormattedHTMLMessage id="edit-facebook-authentication-method-find-id-secret" />
        </Flex>
    );
};

export default FormConfiguration;
