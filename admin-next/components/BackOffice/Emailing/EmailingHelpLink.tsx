import { Button, CapUIIcon } from '@cap-collectif/ui'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { HELP_CENTER_LINK_KEY } from './utils'

type Props = {
  // Translation key of the help center link, e.g. "about-campaigns"
  readonly helpLabel: string
}

/**
 * Help center link, pushed to the right of the toolbar it is rendered in.
 */
const EmailingHelpLink: React.FC<Props> = ({ helpLabel }) => {
  const intl = useIntl()

  return (
    <Button
      as="a"
      href={intl.formatMessage({ id: HELP_CENTER_LINK_KEY })}
      target="_blank"
      rel="noopener noreferrer"
      variant="link"
      variantColor="primary"
      leftIcon={CapUIIcon.Info}
      ml="auto"
    >
      {intl.formatMessage({ id: helpLabel })}
    </Button>
  )
}

export default EmailingHelpLink
