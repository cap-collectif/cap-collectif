import type { FC } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui';
import { IntlShape, useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import CreateCASSSOConfigurationMutation from '@mutations/CreateCASSSOConfigurationMutation';
import FormConfiguration, { casVersionOptions, FormValues } from './FormConfiguration';
import UpdateCASSSOConfigurationMutation from '@mutations/UpdateCASSSOConfigurationMutation';
import { ModalCasConfiguration_ssoConfiguration$key } from '@relay/ModalCasConfiguration_ssoConfiguration.graphql';
import { CasVersion } from '@relay/UpdateCASSSOConfigurationMutation.graphql';

type ModalCasConfigurationProps = {
    readonly ssoConfiguration: ModalCasConfiguration_ssoConfiguration$key | null;
    readonly ssoConnectionName: string;
    readonly isEditing?: boolean;
    readonly isOpen: boolean;
    readonly onClose: () => void;
};

const FRAGMENT = graphql`
    fragment ModalCasConfiguration_ssoConfiguration on CASSSOConfiguration {
        id
        name
        enabled
        casVersion
        casServerUrl
        casCertificate
    }
`;

const onSubmit = (
    data: FormValues,
    intl: IntlShape,
    ssoConnectionName: string,
    isEditing: boolean,
    ssoId: string | undefined,
) => {
    const input = {
        name: data.name,
        casVersion: data.casVersion as CasVersion,
        casServerUrl: data.casServerUrl,
        casCertificate: data.casCertificate,
    };

    if (isEditing && ssoId) {
        UpdateCASSSOConfigurationMutation.commit({
            input: {
                ...input,
                id: ssoId,
            },
        });
    } else {
        CreateCASSSOConfigurationMutation.commit({
            input,
            connections: [ssoConnectionName],
        });
    }
};

const ModalCasConfiguration: FC<ModalCasConfigurationProps> = ({
    ssoConfiguration: ssoConfigurationFragment,
    isEditing,
    ssoConnectionName,
    isOpen,
    onClose,
}) => {
    const intl = useIntl();
    const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);

    const defaultValues =
        ssoConfiguration && isEditing
            ? {
                  name: ssoConfiguration.name,
                  casVersion: casVersionOptions.find(
                      option => option.value === ssoConfiguration.casVersion,
                  )?.value,
                  casServerUrl: ssoConfiguration.casServerUrl,
                  casCertificate: ssoConfiguration.casCertificate,
              }
            : undefined;

    const methods = useForm({
        mode: 'onChange',
        defaultValues,
    });

    return (
        <Modal
            show={isOpen}
            onOpen={() => {
                methods.reset(defaultValues);
            }}
            onClose={onClose}
            ariaLabel={intl.formatMessage({
                id: isEditing ? 'edit-authentication-method' : 'add-cas-authentication-method',
            })}
            size={CapUIModalSize.Lg}>
            <Modal.Header>
                <Modal.Header.Label>
                    {intl.formatMessage({ id: 'add-cas-authentication-method' })}
                </Modal.Header.Label>
                <Heading>{intl.formatMessage({ id: 'global.configuration' })}</Heading>
            </Modal.Header>
            <Modal.Body>
                <FormProvider {...methods}>
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
                        methods.handleSubmit((data: FormValues) =>
                            onSubmit(
                                data,
                                intl,
                                ssoConnectionName,
                                isEditing || false,
                                ssoConfiguration?.id || undefined,
                            ),
                        )(e);
                        onClose();
                    }}>
                    {intl.formatMessage({ id: 'global.save' })}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalCasConfiguration;
