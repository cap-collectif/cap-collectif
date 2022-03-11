import type { FC } from 'react';
import { useForm, FormProvider } from "react-hook-form";
import {
    Button,
    CapUIModalSize,
    Heading,
    Modal,
} from '@cap-collectif/ui';
import { IntlShape, useIntl } from 'react-intl';
import FormConfiguration, { FormValues } from './FormConfiguration';
import { graphql, useFragment } from 'react-relay';
import type { ModalOpenIDConfiguration_ssoConfiguration$key } from '@relay/ModalOpenIDConfiguration_ssoConfiguration.graphql';
import UpdateOauth2SSOConfigurationMutation from '@mutations/UpdateOauth2SSOConfigurationMutation';
import CreateOauth2SSOConfigurationMutation from '@mutations/CreateOauth2SSOConfigurationMutation';

type ModalOpenIDConfigurationProps = {
    readonly ssoConfiguration: ModalOpenIDConfiguration_ssoConfiguration$key | null
    readonly ssoConnectionName: string
    readonly isEditing?: boolean
    readonly isOpen: boolean
    readonly onClose: () => void
}

const FRAGMENT = graphql`
    fragment ModalOpenIDConfiguration_ssoConfiguration on Oauth2SSOConfiguration {
        id
        name
        secret
        enabled
        clientId
        logoutUrl
        profileUrl
        userInfoUrl
        accessTokenUrl
        authorizationUrl
        redirectUri
        disconnectSsoOnLogout
    }
`;

const onSubmit = (
    data: FormValues,
    intl: IntlShape,
    ssoConnectionName: string,
    isEditing: boolean,
    ssoId: string | undefined,
    ssoEnabled: boolean,
) => {
    const input = {
        name: data.name,
        secret: data.secret,
        enabled: isEditing ? ssoEnabled : true,
        clientId: data.clientId,
        logoutUrl: data.logoutUrl,
        profileUrl: data.profileUrl,
        userInfoUrl: data.userInfoUrl,
        accessTokenUrl: data.accessTokenUrl,
        authorizationUrl: data.authorizationUrl,
        disconnectSsoOnLogout: data?.disconnectSsoOnLogout || false,
    }

    if(isEditing && ssoId) {
        UpdateOauth2SSOConfigurationMutation.commit({
            input: {
                id: ssoId,
                ...input,
            },
        })
    } else {
        CreateOauth2SSOConfigurationMutation.commit({
            input,
            connections: [ssoConnectionName]
        })
    }
}

const ModalOpenIDConfiguration: FC<ModalOpenIDConfigurationProps> = ({ ssoConfiguration: ssoConfigurationFragment, isEditing, ssoConnectionName, isOpen, onClose }) => {
    const intl = useIntl();
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);

    const defaultValues = ssoConfiguration && isEditing ? {
        name: ssoConfiguration.name,
        secret: ssoConfiguration.secret,
        enabled: ssoConfiguration.enabled,
        clientId: ssoConfiguration.clientId,
        logoutUrl: ssoConfiguration.logoutUrl,
        profileUrl: ssoConfiguration.profileUrl,
        userInfoUrl: ssoConfiguration.userInfoUrl,
        accessTokenUrl: ssoConfiguration.accessTokenUrl,
        authorizationUrl: ssoConfiguration.authorizationUrl,
        redirectUri: ssoConfiguration.redirectUri,
        disconnectSsoOnLogout: ssoConfiguration.disconnectSsoOnLogout,
    } : undefined

    const methods = useForm({
        mode: 'onChange',
        defaultValues
    });

    return (
        <Modal
            show={isOpen}
            onOpen={() => {
                methods.reset(defaultValues)
            }}
            onClose={onClose}
            ariaLabel={intl.formatMessage({ id: 'setup-openId' })}
            size={CapUIModalSize.Lg}>
                <Modal.Header>
                    <Modal.Header.Label>
                        {intl.formatMessage({ id: isEditing ? 'edit-authentication-method' : 'add-authentication-method' })}
                    </Modal.Header.Label>
                    <Heading>
                        {intl.formatMessage({ id: 'setup-openId' })}
                    </Heading>
                </Modal.Header>
                <Modal.Body>
                    <FormProvider {...methods} >
                        <FormConfiguration />
                    </FormProvider>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        variantColor="primary"
                        variantSize="medium"
                        onClick={onClose}>
                        {intl.formatMessage({ id: 'cancel' })}
                    </Button>
                    <Button
                        variant="primary"
                        variantColor="primary"
                        variantSize="medium"
                        disabled={!methods.formState.isValid || !methods.formState.isDirty}
                        loading={methods.formState.isSubmitting}
                        onClick={e => {
                            methods.handleSubmit((data: FormValues) => onSubmit(data, intl, ssoConnectionName, isEditing || false, ssoConfiguration?.id || undefined, ssoConfiguration?.enabled || false))(e);
                            onClose();
                        }}>
                        {intl.formatMessage({ id: isEditing ? 'global.save' :  'action_enable' })}
                    </Button>
                </Modal.Footer>
        </Modal>
    );
};

export default ModalOpenIDConfiguration;
