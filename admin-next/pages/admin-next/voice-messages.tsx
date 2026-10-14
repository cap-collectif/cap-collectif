import { Button, CapUIIcon, CapUIIconSize, Flex, Spinner, Text } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import { CONNECTION_NODES_PER_PAGE, EXPORT_URL } from '@components/BackOffice/VoiceMessages/utils'
import VoiceMessageList from '@components/BackOffice/VoiceMessages/VoiceMessageList'
import { voiceMessages_Query } from '@relay/voiceMessages_Query.graphql'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import downloadCSV from '@utils/download-csv'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

const QUERY = graphql`
  query voiceMessages_Query($first: Int) {
    ...VoiceMessageList_query @arguments(first: $first)
  }
`

const VoiceMessagesTab: React.FC = () => {
  const intl = useIntl()
  const [isExporting, setIsExporting] = React.useState(false)
  const queryReference = useLazyLoadQuery<voiceMessages_Query>(QUERY, { first: CONNECTION_NODES_PER_PAGE })

  const onExport = async () => {
    setIsExporting(true)
    await downloadCSV(EXPORT_URL, intl)
    setIsExporting(false)
  }

  return (
    <Flex direction="column" width="100%" spacing={6} bg="white" borderRadius="accordion" p={8} justify="flex-start">
      <Flex alignItems="center" justify="space-between" spacing={6}>
        <Text color="gray.700">{intl.formatMessage({ id: 'admin.voice-messages.description' })}</Text>
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="small"
          leftIcon={CapUIIcon.Download}
          isLoading={isExporting}
          onClick={onExport}
        >
          {intl.formatMessage({ id: 'admin.voice-messages.export' })}
        </Button>
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={4} />}>
        <VoiceMessageList queryReference={queryReference} />
      </React.Suspense>
    </Flex>
  )
}

export const getServerSideProps = withFeatureFlagRequired('vocal_contribution', '/admin-next/dashboard')

const VoiceMessagesPage: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.voice-messages.title' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <VoiceMessagesTab />
      </React.Suspense>
    </Layout>
  )
}

export default VoiceMessagesPage
