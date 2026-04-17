import * as React from 'react'
import { AsyncSelect, CapUISpotIcon, CapUISpotIconSize, Flex, Heading, SpotIcon, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql } from 'react-relay'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'
import { environment } from '@utils/relay-environement'

const EVENTS_QUERY = graphql`
  query EventsTabContentQuery($term: String) {
    viewer {
      events(search: $term) {
        edges {
          node {
            value: id
            label: title
          }
        }
      }
    }
  }
` as GraphQLTaggedNode

const EventsTabContent: React.FC = () => {
  const intl = useIntl()

  const loadOptions = async (term: string) => {
    const data = await fetchQuery<any>(environment, EVENTS_QUERY, { term }).toPromise()
    return data?.viewer?.events?.edges?.map(({ node }: { node: { value: string; label: string } }) => node) ?? []
  }

  return (
    <Flex p={8} direction="column" gap="md" bg="white" borderRadius="normal">
      <Flex align="center" gap="md">
        <SpotIcon name={CapUISpotIcon.CALENDAR} size={CapUISpotIconSize.Lg} />
        <Flex direction="column" gap="xs">
          <Heading as="h3" color="blue.900" fontWeight="semibold">
            {intl.formatMessage({ id: 'back.project.tab.events.title' })}
          </Heading>
          <Text color="blue.900">{intl.formatMessage({ id: 'back.project.tab.events.description' })}</Text>
        </Flex>
      </Flex>
      <Flex direction="column" gap="xxs">
        <Text fontSize="13px" color="gray.900">
          {intl.formatMessage({ id: 'back.project.tab.events.select.label' })}{' '}
          <Text as="span" color="primary.base" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
            {intl.formatMessage({ id: 'global.create_one' })}
          </Text>
        </Text>
        <AsyncSelect
          loadOptions={loadOptions}
          defaultOptions
          placeholder={''}
          loadingMessage={() => intl.formatMessage({ id: 'global.loading' })}
          noOptionsMessage={() => intl.formatMessage({ id: 'result-not-found' })}
          inputId="events-select"
          isClearable
        />
      </Flex>
    </Flex>
  )
}

export default EventsTabContent
