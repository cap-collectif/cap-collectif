import type { FC } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Button, CapUIModalSize, Heading, Modal } from '@cap-collectif/ui'
import { IntlShape, useIntl } from 'react-intl'
import FormConfiguration, { FormValues } from './FormConfiguration'
import { graphql, useFragment } from 'react-relay'
import type { ModalFranceConnectConfiguration_ssoConfiguration$key } from '@relay/ModalFranceConnectConfiguration_ssoConfiguration.graphql'
import UpdateFranceConnectSSOConfigurationMutation from '@mutations/UpdateFranceConnectSSOConfigurationMutation'

type ModalFranceConnectConfigurationProps = {
  readonly ssoConfiguration: ModalFranceConnectConfiguration_ssoConfiguration$key | null
  readonly ssoConnectionName: string
  readonly isEditing?: boolean
  readonly onClose: () => void
  readonly isOpen: boolean
}

const FRAGMENT = graphql`
  fragment ModalFranceConnectConfiguration_ssoConfiguration on FranceConnectSSOConfiguration {
    clientId
    secret
    environment
    redirectUri
    logoutUrl
    allowedData
    enabled
  }
`

const onSubmit = (
  data: FormValues,
  intl: IntlShape,
  ssoConnectionName: string,
  ssoEnabled: boolean,
  isEditing: boolean,
) => {
  return UpdateFranceConnectSSOConfigurationMutation.commit({
    input: {
      environment: data.environment ? 'TESTING' : 'PRODUCTION',
      clientId: data.clientId,
      secret: data.secret,
      given_name: data.given_name || false,
      family_name: data.family_name || false,
      birthdate: data.birthdate || false,
      gender: data.gender || false,
      birthplace: data.birthplace || false,
      birthcountry: data.birthcountry || false,
      email: data.email || false,
      preferred_username: data.preferred_username || false,
      enabled: isEditing ? ssoEnabled : true,
    },
    connections: [ssoConnectionName],
  })
}

const ModalFranceConnectConfiguration: FC<ModalFranceConnectConfigurationProps> = ({
  ssoConfiguration: ssoConfigurationFragment,
  isEditing = false,
  ssoConnectionName,
  isOpen,
  onClose,
}) => {
  const intl = useIntl()
  const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment)

  const defaultValues =
    ssoConfiguration && isEditing
      ? {
          environment: ssoConfiguration.environment === 'TESTING',
          clientId: ssoConfiguration.clientId,
          secret: ssoConfiguration.secret,
          logoutUrl: ssoConfiguration.logoutUrl,
          redirectUri: ssoConfiguration.redirectUri,
          given_name: ssoConfiguration.allowedData.includes('given_name'),
          family_name: ssoConfiguration.allowedData.includes('family_name'),
          birthdate: ssoConfiguration.allowedData.includes('birthdate'),
          gender: ssoConfiguration.allowedData.includes('gender'),
          birthplace: ssoConfiguration.allowedData.includes('birthplace'),
          birthcountry: ssoConfiguration.allowedData.includes('birthcountry'),
          email: ssoConfiguration.allowedData.includes('email'),
          preferred_username: ssoConfiguration.allowedData.includes('preferred_username'),
        }
      : undefined

  const methods = useForm({
    mode: 'onChange',
    defaultValues,
  })

  return (
    <Modal
      show={isOpen}
      onOpen={() => {
        methods.reset(defaultValues)
      }}
      onClose={onClose}
      ariaLabel={intl.formatMessage({ id: 'configure-franceconnect' })}
      size={CapUIModalSize.Lg}
    >
      <Modal.Header>
        <Modal.Header.Label>
          {intl.formatMessage({ id: isEditing ? 'edit-authentication-method' : 'activate-authentication-method' })}
        </Modal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'configure-franceconnect' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <FormProvider {...methods}>
          <FormConfiguration />
        </FormProvider>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" variantColor="primary" variantSize="medium" onClick={onClose}>
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
              onSubmit(data, intl, ssoConnectionName, ssoConfiguration?.enabled || false, isEditing),
            )(e)
            onClose()
          }}
        >
          {intl.formatMessage({ id: isEditing ? 'global.save' : 'action_enable' })}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalFranceConnectConfiguration
