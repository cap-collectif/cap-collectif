import { FC, useState } from 'react'
import CardSSO from '@ui/CardSSO/CardSSO'
import { Button, ButtonQuickAction, CapUIFontSize, CapUIIcon, Switch, Text } from '@cap-collectif/ui'
import logo from './Logo'
import { graphql, useFragment } from 'react-relay'
import type { CardFacebook_ssoConfiguration$key } from '@relay/CardFacebook_ssoConfiguration.graphql'
import ModalFacebookConfiguration from './ModalFacebookConfiguration'
import { toggleFacebook } from '@mutations/UpdateFacebookSSOConfigurationMutation'
import { useMultipleDisclosure } from '@liinkiing/react-hooks'
import { useIntl } from 'react-intl'

type CardFacebookProps = {
  readonly ssoConfiguration: CardFacebook_ssoConfiguration$key | null
  readonly ssoConnectionName: string
}

const FRAGMENT = graphql`
  fragment CardFacebook_ssoConfiguration on FacebookSSOConfiguration {
    __typename
    clientId
    secret
    enabled
    ...ModalFacebookConfiguration_ssoConfiguration
  }
`

const CardFacebook: FC<CardFacebookProps> = ({ ssoConfiguration: ssoConfigurationFragment, ssoConnectionName }) => {
  const intl = useIntl()
  const [hover, setHover] = useState(false)
  const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment)
  const { onClose, onOpen, isOpen } = useMultipleDisclosure({
    'facebook-configuration': false,
    'facebook-configuration-editing': false,
  })

  return (
    <>
      <CardSSO onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <CardSSO.Header>
          {hover ? (
            <ButtonQuickAction
              variantColor="primary"
              icon={CapUIIcon.Pencil}
              label={intl.formatMessage({ id: 'action_edit' })}
              onClick={onOpen('facebook-configuration-editing')}
            />
          ) : (
            logo
          )}
        </CardSSO.Header>
        <CardSSO.Body>
          <Text as="label" color="gray.900" fontSize={CapUIFontSize.BodyRegular} htmlFor="sso-facebook">
            Facebook
          </Text>

          {ssoConfiguration?.clientId ? (
            <Switch
              id="sso-facebook"
              checked={ssoConfiguration.enabled}
              onChange={() => toggleFacebook(ssoConfiguration, ssoConnectionName)}
            />
          ) : (
            <Button variantColor="primary" variant="tertiary" onClick={onOpen('facebook-configuration')} alternative>
              {intl.formatMessage({ id: 'global.configure' })}
            </Button>
          )}
        </CardSSO.Body>
      </CardSSO>

      <ModalFacebookConfiguration
        ssoConfiguration={ssoConfiguration}
        ssoConnectionName={ssoConnectionName}
        isEditing
        onClose={onClose('facebook-configuration-editing')}
        isOpen={isOpen('facebook-configuration-editing')}
      />

      <ModalFacebookConfiguration
        ssoConfiguration={null}
        ssoConnectionName={ssoConnectionName}
        onClose={onClose('facebook-configuration')}
        isOpen={isOpen('facebook-configuration')}
      />
    </>
  )
}

export default CardFacebook
