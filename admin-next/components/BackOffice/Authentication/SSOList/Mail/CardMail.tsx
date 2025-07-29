import type { FC } from 'react'
import CardSSO from '@ui/CardSSO/CardSSO'
import { CapUIFontSize, CapUIIcon, CapUIIconSize, Icon, Switch, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

const CardMail: FC = () => {
  const intl = useIntl()

  return (
    <CardSSO>
      <CardSSO.Header>
        <Icon size={CapUIIconSize.Xl} name={CapUIIcon.Envelope} color="gray.500" />
      </CardSSO.Header>
      <CardSSO.Body>
        <Text as="label" color="gray.900" fontSize={CapUIFontSize.BodyRegular} htmlFor="mail" opacity={0.3}>
          {intl.formatMessage({ id: 'global.email' })}
        </Text>

        <Switch id="mail" checked disabled />
      </CardSSO.Body>
    </CardSSO>
  )
}

export default CardMail
