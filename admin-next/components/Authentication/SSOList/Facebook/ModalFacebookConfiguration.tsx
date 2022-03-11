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
import type { ModalFacebookConfiguration_ssoConfiguration$key } from '@relay/ModalFacebookConfiguration_ssoConfiguration.graphql';
import UpdateFacebookSSOConfigurationMutation from '@mutations/UpdateFacebookSSOConfigurationMutation';

type ModalFacebookConfigurationProps = {
    readonly ssoConfiguration: ModalFacebookConfiguration_ssoConfiguration$key | null
    readonly ssoConnectionName: string
    readonly isEditing?: boolean
    readonly onClose: () => void
    readonly isOpen: boolean
}

const FRAGMENT = graphql`
    fragment ModalFacebookConfiguration_ssoConfiguration on FacebookSSOConfiguration {
        clientId
        secret
        enabled
    }
`;

const onSubmit = (data: FormValues, intl: IntlShape, ssoConnectionName: string, ssoEnabled: boolean, isEditing: boolean) => {
    return UpdateFacebookSSOConfigurationMutation.commit({
        input: {
            clientId: data.clientId,
            secret: data.secret,
            enabled: isEditing ? ssoEnabled : true,
        },
        connections: [ssoConnectionName]
    });
}

const ModalFacebookConfiguration: FC<ModalFacebookConfigurationProps> = ({ ssoConfiguration: ssoConfigurationFragment, isEditing = false, ssoConnectionName, isOpen, onClose }) => {
    const intl = useIntl();
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);

    const defaultValues =  ssoConfiguration && isEditing ? {
        clientId: ssoConfiguration.clientId,
        secret: ssoConfiguration.secret
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
            ariaLabel={intl.formatMessage({ id: 'edit-facebook-authentication-method' })}
            size={CapUIModalSize.Lg}>
                <Modal.Header>
                    <Modal.Header.Label>
                        {intl.formatMessage({ id: isEditing ? 'edit-authentication-method' : 'activate-authentication-method' })}
                    </Modal.Header.Label>
                    <Heading>
                        {intl.formatMessage({ id: 'edit-facebook-authentication-method' })}
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
                            methods.handleSubmit((data: FormValues) => onSubmit(data, intl, ssoConnectionName, ssoConfiguration?.enabled || false, isEditing))(e);
                            onClose();
                        }}>
                        {intl.formatMessage({ id: isEditing ? 'global.save' :  'action_enable' })}
                    </Button>
                </Modal.Footer>
        </Modal>
    );
};

export default ModalFacebookConfiguration;
