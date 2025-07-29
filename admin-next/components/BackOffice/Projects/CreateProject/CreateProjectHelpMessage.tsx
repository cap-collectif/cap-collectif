import React, { FC } from 'react'
import { Box, Text } from '@cap-collectif/ui'
import HelpMessage from '@ui/HelpMessage/HelpMessage'
import { useIntl } from 'react-intl'

type Props = {
  showHelpMessage: boolean
}
const CreateProjectHelpMessage: FC<Props> = ({ showHelpMessage }) => {
  const intl = useIntl()

  return (
    <Box
      maxWidth="486px"
      mb="32px"
      opacity={showHelpMessage ? 1 : 0}
      sx={{
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <HelpMessage variant="info">
        <Box>
          <Text lineHeight="initial">
            {intl.formatMessage({ id: 'choose-a-short-and-precise-title-that-allow-to-identify-your-project' })}
          </Text>
          <Text lineHeight="initial">
            {intl.formatMessage({ id: 'this-is-an-example-of-projects-that-succeeded' })}
          </Text>
          <Box my={4}>
            <Text lineHeight="initial">✅ La fabrique à projets citoyens d'Herbignac</Text>
            <Text lineHeight="initial">✅ Le Savès en 2030, quel futur voulons nous ?</Text>
          </Box>
          <Text mb={4}>❌ Petites Villes de Demain : "Donnez votre avis sur votre ville"</Text>
        </Box>
      </HelpMessage>
    </Box>
  )
}

export default CreateProjectHelpMessage
