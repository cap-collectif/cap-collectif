import { FC, useState } from 'react'
import CardSSO from '@ui/CardSSO/CardSSO'
import { ButtonGroup, ButtonQuickAction, CapUIIcon, Switch, Text } from '@cap-collectif/ui'
import logo from './Logo'
import { graphql, useFragment } from 'react-relay'
import type { CardOpenID_ssoConfiguration$key } from '@relay/CardOpenID_ssoConfiguration.graphql'
import ModalOpenIDConfiguration from './ModalOpenIDConfiguration'
import ModalOpenIDDelete from './ModalOpenIDDelete'
import { toggleSSO } from '@mutations/ToggleSSOConfigurationStatusMutation'
import { useIntl } from 'react-intl'
import { useMultipleDisclosure } from '@liinkiing/react-hooks'

type CardOpenIDProps = {
  readonly ssoConfiguration: CardOpenID_ssoConfiguration$key
  readonly ssoConnectionName: string
}

const FRAGMENT = graphql`
  fragment CardOpenID_ssoConfiguration on Oauth2SSOConfiguration {
    id
    enabled
    name
    __typename
    ...ModalOpenIDConfiguration_ssoConfiguration
    ...ModalOpenIDDelete_ssoConfiguration
  }
`

const CardOpenID: FC<CardOpenIDProps> = ({ ssoConfiguration: ssoConfigurationFragment, ssoConnectionName }) => {
  const intl = useIntl()
  const [hover, setHover] = useState(false)
  const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment)
  const { onClose, onOpen, isOpen } = useMultipleDisclosure({
    'openID-configuration': false,
    'openID-delete': false,
  })

  return (
    <>
      <CardSSO onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <CardSSO.Header>
          {hover ? (
            <ButtonGroup>
              <ButtonQuickAction
                variantColor="blue"
                icon={CapUIIcon.Pencil}
                label={intl.formatMessage({ id: 'action_edit' })}
                onClick={onOpen('openID-configuration')}
              />
              <ButtonQuickAction
                variantColor="red"
                icon={CapUIIcon.Trash}
                label={intl.formatMessage({ id: 'action_delete' })}
                onClick={onOpen('openID-delete')}
              />
            </ButtonGroup>
          ) : (
            logo
          )}
        </CardSSO.Header>

        <CardSSO.Body spacing={2}>
          <Text as="label" color="gray.900" fontSize={3} htmlFor={`sso-${ssoConfiguration.id}`}>
            {ssoConfiguration.name}
          </Text>

          <Switch
            id={`sso-${ssoConfiguration.id}`}
            checked={ssoConfiguration.enabled}
            onChange={() => toggleSSO(ssoConfiguration.id, ssoConfiguration.enabled, ssoConfiguration.__typename)}
          />
        </CardSSO.Body>
      </CardSSO>

      <ModalOpenIDConfiguration
        ssoConfiguration={ssoConfiguration}
        ssoConnectionName={ssoConnectionName}
        isEditing
        isOpen={isOpen('openID-configuration')}
        onClose={onClose('openID-configuration')}
      />

      <ModalOpenIDDelete
        ssoConfiguration={ssoConfiguration}
        isOpen={isOpen('openID-delete')}
        onClose={onClose('openID-delete')}
      />
    </>
  )
}

export default CardOpenID
