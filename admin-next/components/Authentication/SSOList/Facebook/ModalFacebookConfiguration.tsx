import type { FC } from 'react';
import { useForm, FormProvider } from "react-hook-form";
import {
    Button,
    ButtonQuickAction,
    CapUIIcon,
    CapUIModalSize,
    Heading,
    Modal,
} from '@cap-collectif/ui';
import { IntlShape, useIntl } from 'react-intl';
import FormConfiguration, { FormValues } from './FormConfiguration';
import { graphql, useFragment } from 'react-relay';
import type { ModalFacebookConfiguration_ssoConfiguration$key } from '@relay/ModalFacebookConfiguration_ssoConfiguration.graphql';
import { mutationErrorToast } from '@utils/mutation-error-toast';
import UpdateFacebookSSOConfigurationMutation from '@mutations/UpdateFacebookSSOConfigurationMutation';

type ModalFacebookConfigurationProps = {
    readonly ssoConfiguration: ModalFacebookConfiguration_ssoConfiguration$key | null
    readonly ssoConnectionName: string
    readonly isEditing?: boolean
}

const FRAGMENT = graphql`
    fragment ModalFacebookConfiguration_ssoConfiguration on FacebookSSOConfiguration {
        clientId
        secret
    }
`;

const onSubmit = (data: FormValues, intl: IntlShape, reset: () => void, ssoConnectionName: string) => {
    return UpdateFacebookSSOConfigurationMutation.commit({
        input: {
            clientId: data.clientId,
            secret: data.secret,
            enabled: !!data.secret && !!data.clientId
        },
        connections: [ssoConnectionName]
    }).then(() => {
        reset();
    })
        .catch(() => {
            reset();
            mutationErrorToast(intl)
        });
}

const ModalFacebookConfiguration: FC<ModalFacebookConfigurationProps> = ({ ssoConfiguration: ssoConfigurationFragment, isEditing, ssoConnectionName }) => {
    const intl = useIntl();
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);
    const methods = useForm({
        mode: 'onChange',
        defaultValues: ssoConfiguration && isEditing ? {
            clientId: ssoConfiguration.clientId,
            secret: ssoConfiguration.secret
        } : undefined
    });

    return (
        <Modal
            disclosure={
                isEditing ?
                    <ButtonQuickAction
                        variantColor="blue"
                        icon={CapUIIcon.Pencil}
                        label={intl.formatMessage({ id: 'action_edit' })}
                    /> : <Button variantColor="primary" variant="tertiary" alternative>
                    {intl.formatMessage({ id: 'global.configure' })}
                </Button>
            }
            ariaLabel={intl.formatMessage({ id: 'edit-facebook-authentication-method' })}
            size={CapUIModalSize.Lg}>
            {({ hide }) => (
                <>
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
                            onClick={hide}>
                            {intl.formatMessage({ id: 'cancel' })}
                        </Button>
                        <Button
                            variant="primary"
                            variantColor="primary"
                            variantSize="medium"
                            loading={methods.formState.isSubmitting}
                            onClick={e => {
                                methods.handleSubmit((data: FormValues) => onSubmit(data, intl, methods.reset, ssoConnectionName))(e);
                                hide();
                            }}>
                            {intl.formatMessage({ id: isEditing ? 'global.save' :  'action_enable' })}
                        </Button>
                    </Modal.Footer>
                </>
            )}
        </Modal>
    );
};

export default ModalFacebookConfiguration;
