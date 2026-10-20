import { CapUIIcon, CapUIIconSize, Icon } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'

// Shown next to a menu link opening in a new tab
const ExternalLinkIcon: React.FC = () => {
  const intl = useIntl()

  return (
    <>
      <Icon name={CapUIIcon.Preview} size={CapUIIconSize.Sm} aria-hidden="true" ml={1} verticalAlign="middle" />
      <span className="sr-only">{intl.formatMessage({ id: 'editor.link.target' })}</span>
    </>
  )
}

export const externalLinkProps = { target: '_blank', rel: 'noopener noreferrer' }

// Keeps the icon on the same line as the text of an inline link
export const externalLinkStyle = { display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' } as const

export default ExternalLinkIcon
