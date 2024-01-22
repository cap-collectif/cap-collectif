import * as React from 'react'
import { FormattedHTMLMessage } from 'react-intl'
import HelpMessage from '@ui/HelpMessage/HelpMessage'
import { Box } from '@cap-collectif/ui'

export interface StepCreationSideProps {
  helpMessage: string | null
}

const StepCreationSide: React.FC<StepCreationSideProps> = ({ helpMessage }) => {
  if (helpMessage !== null) {
    return (
      <Box width="30%" borderRadius="8px">
        <HelpMessage variant="info">
          <FormattedHTMLMessage id={helpMessage} />
        </HelpMessage>
      </Box>
    )
  }
  return null
}

export default StepCreationSide
