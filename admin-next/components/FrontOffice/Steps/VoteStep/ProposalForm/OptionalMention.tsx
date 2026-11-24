import * as React from 'react'
import { useIntl } from 'react-intl'

/**
 * Screen reader only "(facultatif)" mention, rendered inside a field label.
 * The form states (also screen reader only) that all the fields are required unless mentioned otherwise.
 */
const OptionalMention: React.FC = () => {
  const intl = useIntl()

  return <span className="sr-only"> ({intl.formatMessage({ id: 'global.optional' }).trim()})</span>
}

export default OptionalMention
