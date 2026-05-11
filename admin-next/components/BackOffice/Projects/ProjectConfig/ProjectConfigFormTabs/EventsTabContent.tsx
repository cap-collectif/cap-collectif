import * as React from 'react'
import { AsyncSelect, CapUISpotIcon, CapUISpotIconSize, Flex, Heading, SpotIcon, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'
import { environment } from '@utils/relay-environement'
import UpdateEventsProjectTabMutation from '@mutations/UpdateEventsProjectTabMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { EventsTabContent_tab$key } from '@relay/EventsTabContent_tab.graphql'
import DraggableItemRow from './DraggableItemRow'
import useDraggableItemList from './useDraggableItemList'

export const EVENTS_TAB_FRAGMENT = graphql`
  fragment EventsTabContent_tab on ProjectTabEvents {
    id
    title
    slug
    enabled
    events {
      id
      title
      media {
        url
      }
    }
  }
`

const EVENTS_QUERY = graphql`
  query EventsTabContentQuery($term: String) {
    viewer {
      events(search: $term) {
        edges {
          node {
            value: id
            label: title
            media {
              url
            }
          }
        }
      }
    }
  }
` as GraphQLTaggedNode

type Option = { value: string; label: string; cover?: string }
type EventItem = { id: string; title: string; cover?: string }

type EventsTabContentProps = {
  tab: EventsTabContent_tab$key
}

const EventsTabContent: React.FC<EventsTabContentProps> = ({ tab: tabRef }) => {
  const tab = useFragment(EVENTS_TAB_FRAGMENT, tabRef)
  const intl = useIntl()
  const { setSaving } = useNavBarContext()

  const onSave = async (items: EventItem[]): Promise<boolean> => {
    setSaving(true)
    try {
      await UpdateEventsProjectTabMutation.commit({
        input: {
          tabId: tab.id,
          title: tab.title,
          enabled: tab.enabled,
          eventItems: items.map((item, i) => ({ id: item.id, position: i + 1 })),
        },
      })
      successToast(intl.formatMessage({ id: 'global.changes.saved' }))
      return true
    } catch {
      mutationErrorToast(intl)
      return false
    } finally {
      setSaving(false)
    }
  }

  const initialItems = tab.events?.map(e => ({ id: e.id, title: e.title, cover: e.media?.url ?? undefined })) ?? []

  const { localItems, selectValue, isAdding, handleAdd, handleRemove } = useDraggableItemList({
    initialItems,
    type: 'event-item',
    tabId: tab.id,
    onSave,
  })

  const loadOptions = async (term: string) => {
    const data = await fetchQuery<any>(environment, EVENTS_QUERY, { term }).toPromise()
    const selectedIds = new Set(localItems.map(i => i.id))
    return (
      data?.viewer?.events?.edges?.map(({ node }: { node: Option & { media?: { url: string } } }) => ({
        value: node.value,
        label: node.label,
        cover: node.media?.url,
      })) ?? []
    ).filter((option: Option) => !selectedIds.has(option.value))
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
          <Text
            as="a"
            href="/admin-next/event"
            target="_blank"
            rel="noopener noreferrer"
            color="primary.base"
            sx={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            {intl.formatMessage({ id: 'global.create_one' })}
          </Text>
        </Text>
        <AsyncSelect
          loadOptions={loadOptions}
          defaultOptions
          value={selectValue}
          onChange={selected => handleAdd((selected as Option | null) ?? null)}
          placeholder={''}
          loadingMessage={() => intl.formatMessage({ id: 'global.loading' })}
          noOptionsMessage={() => intl.formatMessage({ id: 'result-not-found' })}
          inputId="events-select"
          isLoading={isAdding}
          isDisabled={isAdding}
        />
        {localItems.length > 0 && (
          <Flex direction="column" gap="xs" mt="xs">
            {localItems.map((item, index) => (
              <DraggableItemRow key={item.id} item={item} index={index} type="event-item" onRemove={handleRemove} />
            ))}
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

export default EventsTabContent
