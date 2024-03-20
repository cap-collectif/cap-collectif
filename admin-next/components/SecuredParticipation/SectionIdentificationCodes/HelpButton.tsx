import { FC } from 'react'
import { Button } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

export const HelpUrl = 'https://aide.cap-collectif.com/article/247-code-didentification-unique'

const HelpButton: FC = () => {
  const intl = useIntl()

  return (
    <Button as="a" variant="tertiary" href={HelpUrl} target="_blank" ml={4}>
      {intl.formatMessage({ id: 'learn.more' })}
    </Button>
  )
}

export default HelpButton
