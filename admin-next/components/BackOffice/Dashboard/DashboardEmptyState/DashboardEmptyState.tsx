import type { FC } from 'react'
import Link from 'next/link'
import { useIntl } from 'react-intl'
import { Box, Heading, Text, Button, CapUILineHeight, CapUIFontSize } from '@cap-collectif/ui'

const DashboardEmptyState: FC = () => {
  const intl = useIntl()

  return (
    <Box pl={14} pt={14} width="100%" height="100vh" backgroundColor="gray.100">
      <Heading as="h1" color="blue.900" fontSize={CapUIFontSize.DisplayLarge} mb={5} lineHeight={CapUILineHeight.XXL}>
        {intl.formatMessage({ id: 'project.stats.title' })}
      </Heading>
      <Box width="50%" mb={8} color="blue.900" fontSize={CapUIFontSize.Headline}>
        <Text mb={4}>{intl.formatMessage({ id: 'this-is-where-you-can-check-analysis-data' })}</Text>
        <Text>{intl.formatMessage({ id: 'must-create-project-before-analysis' })}</Text>
      </Box>
      <Link href="/admin-next/projects" passHref>
        <Button as="a" variant="primary" variantSize="big">
          {intl.formatMessage({ id: 'create-a-project' })}
        </Button>
      </Link>
    </Box>
  )
}

export default DashboardEmptyState
