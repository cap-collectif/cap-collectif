import type { FC } from 'react';
import { Flex, Text } from '@cap-collectif/ui';
import FieldInput from '../../../Form/FieldInput';
import * as React from 'react';
import { useIntl, FormattedHTMLMessage } from 'react-intl';
import { useFormContext } from 'react-hook-form';

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

            <FieldInput
                id="clientId"
                name="clientId"
                required
                label={intl.formatMessage({ id: 'App-ID' })}
                placeholder="ex : 1714596595426186"
                control={control}
                type="text"
                pattern={{
                    value: /^\d+$/,
                    message: intl.formatMessage({ id: 'facebook-app-id-must-be-16-digits' }),
                }}
            />

            <FieldInput
                name="secret"
                type="password"
                id="secret"
                label={intl.formatMessage({
                    id: 'App-secret',
                })}
                control={control}
                placeholder="ex : fe7bXXXXXXXXXXXXXXXXXXXXXXXX03xx"
                required
                validate={{
                    equalTo: value =>
                        value.length !== 32 &&
                        intl.formatMessage({ id: 'facebook-app-secret-must-be-32-char' }),
                }}
            />

            <FormattedHTMLMessage id="edit-facebook-authentication-method-find-id-secret" />
        </Flex>
    );
};

export default FormConfiguration;
