import * as React from 'react'
import { AsyncSelect, CapUISpotIcon, CapUISpotIconSize, Flex, Heading, SpotIcon, Text } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'
import { environment } from '@utils/relay-environement'
import UpdateNewsProjectTabMutation from '@mutations/UpdateNewsProjectTabMutation'
import { mutationErrorToast, successToast } from '@shared/utils/toasts'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { NewsTabContent_tab$key } from '@relay/NewsTabContent_tab.graphql'
import DraggableItemRow from './DraggableItemRow'
import useDraggableItemList from './useDraggableItemList'

export const NEWS_TAB_FRAGMENT = graphql`
  fragment NewsTabContent_tab on ProjectTabNews {
    id
    title
    slug
    enabled
    news {
      id
      title
      media {
        url
      }
    }
  }
`

const NEWS_QUERY = graphql`
  query NewsTabContentQuery($term: String) {
    viewer {
      posts(query: $term) {
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
type NewsItem = { id: string; title: string; cover?: string }

type NewsTabContentProps = {
  tab: NewsTabContent_tab$key
}

const NewsTabContent: React.FC<NewsTabContentProps> = ({ tab: tabRef }) => {
  const tab = useFragment(NEWS_TAB_FRAGMENT, tabRef)
  const intl = useIntl()
  const { setSaving } = useNavBarContext()

  const onSave = async (items: NewsItem[]): Promise<boolean> => {
    setSaving(true)
    try {
      await UpdateNewsProjectTabMutation.commit({
        input: {
          tabId: tab.id,
          title: tab.title,
          enabled: tab.enabled,
          newsItems: items.map((item, i) => ({ id: item.id, position: i + 1 })),
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

  const initialItems = tab.news?.map(n => ({ id: n.id, title: n.title, cover: n.media?.url ?? undefined })) ?? []

  const { localItems, selectValue, isAdding, handleAdd, handleRemove } = useDraggableItemList({
    initialItems,
    type: 'news-item',
    tabId: tab.id,
    onSave,
  })

  const loadOptions = async (term: string) => {
    const data = await fetchQuery<any>(environment, NEWS_QUERY, { term }).toPromise()
    const selectedIds = new Set(localItems.map(i => i.id))
    return (
      data?.viewer?.posts?.edges?.map(({ node }: { node: Option & { media?: { url: string } } }) => ({
        value: node.value,
        label: node.label,
        cover: node.media?.url,
      })) ?? []
    ).filter((option: Option) => !selectedIds.has(option.value))
  }

  return (
    <Flex p={8} direction="column" gap="md" bg="white" borderRadius="normal">
      <Flex align="center" gap="md">
        <SpotIcon name={CapUISpotIcon.NEWSPAPER} size={CapUISpotIconSize.Lg} />
        <Flex direction="column" gap="xs">
          <Heading as="h3" color="blue.900" fontWeight="semibold">
            {intl.formatMessage({ id: 'back.project.tab.news.title' })}
          </Heading>
          <Text color="blue.900">{intl.formatMessage({ id: 'back.project.tab.news.description' })}</Text>
        </Flex>
      </Flex>
      <Flex direction="column" gap="xxs">
        <Text fontSize="13px" color="gray.900">
          {intl.formatMessage({ id: 'back.project.tab.news.select.label' })}{' '}
          <Text
            as="a"
            href="/admin-next/post"
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
          inputId="news-select"
          isLoading={isAdding}
          isDisabled={isAdding}
        />
        {localItems.length > 0 && (
          <Flex direction="column" gap="xs" mt="xs">
            {localItems.map((item, index) => (
              <DraggableItemRow key={item.id} item={item} index={index} type="news-item" onRemove={handleRemove} />
            ))}
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

export default NewsTabContent
