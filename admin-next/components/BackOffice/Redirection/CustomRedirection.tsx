import * as React from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import {
  Box,
  Button,
  ButtonGroup,
  ButtonQuickAction,
  CapUIIcon,
  CapUIIconSize,
  Flex,
  Heading,
  Table,
  Tag,
  Text,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import type { CustomRedirectionQuery } from '@relay/CustomRedirectionQuery.graphql'
import type { CustomRedirectionPaginationQuery } from '@relay/CustomRedirectionPaginationQuery.graphql'
import type { CustomRedirection_query$key } from '@relay/CustomRedirection_query.graphql'
import AddRedirectModal from './AddRedirectModal'
import DeleteRedirectModal from './DeleteRedirectModal'
import ShortenUrlModal from './ShortenUrlModal'
import normalizeSourceUrl from './normalizeSourceUrl'
import { RedirectDuration, RedirectRow } from './types'

const REDIRECTS_PAGINATION_COUNT = 100

const QUERY = graphql`
  query CustomRedirectionQuery($count: Int = 100, $cursor: String) {
    ...CustomRedirection_query @arguments(count: $count, cursor: $cursor)
  }
`

const FRAGMENT = graphql`
  fragment CustomRedirection_query on Query
  @argumentDefinitions(count: { type: "Int", defaultValue: 100 }, cursor: { type: "String" })
  @refetchable(queryName: "CustomRedirectionPaginationQuery") {
    siteSettings {
      capcoDomain
      customDomain
    }
    httpRedirects(first: $count, after: $cursor) @connection(key: "CustomRedirection_httpRedirects") {
      __id
      totalCount
      edges {
        node {
          id
          sourceUrl
          destinationUrl
          duration
          redirectType
          createdAt
          updatedAt
        }
      }
    }
  }
`

const CustomRedirection: React.FC = () => {
  const intl = useIntl()
  const queryRef = useLazyLoadQuery<CustomRedirectionQuery>(QUERY, { count: REDIRECTS_PAGINATION_COUNT })
  const { data: query, loadNext, hasNext, isLoadingNext } = usePaginationFragment<
    CustomRedirectionPaginationQuery,
    CustomRedirection_query$key
  >(FRAGMENT, queryRef)

  const redirects = React.useMemo<RedirectRow[]>(() => {
    return (
      query.httpRedirects?.edges
        ?.map(edge => edge?.node)
        .filter((node): node is NonNullable<typeof node> => !!node)
        .map(node => ({
          id: node.id,
          sourceUrl: node.sourceUrl,
          destinationUrl: node.destinationUrl,
          duration: node.duration as RedirectDuration,
          redirectType: node.redirectType as RedirectRow['redirectType'],
        })) ?? []
    )
  }, [query.httpRedirects?.edges])

  const usedSourceUrls = React.useMemo(() => {
    const set = new Set<string>()
    redirects.forEach(redirect => set.add(normalizeSourceUrl(redirect.sourceUrl)))
    return set
  }, [redirects])

  const connectionId = query.httpRedirects?.__id
  const sourceUrlOrigin = typeof window !== 'undefined' ? window.location.origin : undefined
  const allowedSourceHosts = React.useMemo(
    () =>
      [
        typeof window !== 'undefined' ? window.location.hostname : null,
        query.siteSettings?.capcoDomain,
        query.siteSettings?.customDomain,
      ].filter((host): host is string => typeof host === 'string' && host.length > 0),
    [query.siteSettings?.capcoDomain, query.siteSettings?.customDomain],
  )

  return (
    <Box bg="white" p={6} borderRadius="8px" mb={8}>
      <Flex align="center" justify="space-between" mb={4}>
        <Heading as="h4" color="blue.800" fontWeight={600}>
          {intl.formatMessage({ id: 'admin.domain-url.url-management.title' })}
        </Heading>
        <ButtonGroup spacing={2}>
          <ShortenUrlModal
            connectionId={connectionId}
            usedSourceUrls={usedSourceUrls}
            allowedSourceHosts={allowedSourceHosts}
            sourceUrlOrigin={sourceUrlOrigin}
            disclosure={
              <Button variant="secondary" variantColor="primary" variantSize="small">
                {intl.formatMessage({ id: 'admin.domain-url.url-management.shorten-url' })}
              </Button>
            }
          />
          <AddRedirectModal
            connectionId={connectionId}
            usedSourceUrls={usedSourceUrls}
            allowedSourceHosts={allowedSourceHosts}
            sourceUrlOrigin={sourceUrlOrigin}
            disclosure={
              <Button variant="secondary" variantColor="primary" variantSize="small">
                {intl.formatMessage({ id: 'admin.domain-url.url-management.add-redirect' })}
              </Button>
            }
          />
        </ButtonGroup>
      </Flex>

      <Table emptyMessage={<Box />} width="100%">
        <Table.Thead>
          <Table.Tr>
            <Table.Th width="40%">{intl.formatMessage({ id: 'admin.domain-url.url-management.platform-url' })}</Table.Th>
            <Table.Th width="35%">
              {intl.formatMessage({ id: 'admin.domain-url.url-management.destination-url' })}
            </Table.Th>
            <Table.Th width="15%">
              {intl.formatMessage({ id: 'admin.domain-url.url-management.redirect-duration' })}
            </Table.Th>
            <Table.Th width="10%">{intl.formatMessage({ id: 'admin.domain-url.url-management.actions' })}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {redirects.map((row, index) => (
            <Table.Tr key={row.id} rowId={row.id} bg={index % 2 === 0 ? 'white' : 'gray.50'}>
              <Table.Td>
                <Text truncate={64}>{row.sourceUrl}</Text>
              </Table.Td>
              <Table.Td>
                <Text truncate={64}>{row.destinationUrl}</Text>
              </Table.Td>
              <Table.Td textAlign="center">
                <Flex justify="center">
                  <Tag variantColor={row.duration === 'TEMPORARY' ? 'warning' : 'info'}>
                    {intl.formatMessage({
                      id:
                        row.duration === 'TEMPORARY'
                          ? 'admin.domain-url.url-management.duration-temporary'
                          : 'admin.domain-url.url-management.duration-permanent',
                    })}
                  </Tag>
                </Flex>
              </Table.Td>
              <Table.Td>
                <Flex justify="flex-end" spacing={2}>
                  <ButtonQuickAction
                    icon={CapUIIcon.Eye}
                    size={CapUIIconSize.Md}
                    variantColor="hierarchy"
                    label={intl.formatMessage({ id: 'admin.domain-url.url-management.action-view' })}
                    onClick={() => {
                      if (typeof window === 'undefined') return
                      const url = new URL(row.sourceUrl, window.location.origin).toString()
                      window.open(url, '_blank', 'noopener,noreferrer')
                    }}
                  />
                  {row.redirectType === 'URL_SHORTENING' ? (
                    <ShortenUrlModal
                      connectionId={connectionId}
                      usedSourceUrls={usedSourceUrls}
                      allowedSourceHosts={allowedSourceHosts}
                      sourceUrlOrigin={sourceUrlOrigin}
                      editingRedirect={row}
                      disclosure={
                        <ButtonQuickAction
                          icon={CapUIIcon.Pencil}
                          size={CapUIIconSize.Md}
                          variantColor="hierarchy"
                          label={intl.formatMessage({ id: 'global.edit' })}
                        />
                      }
                    />
                  ) : (
                    <AddRedirectModal
                      connectionId={connectionId}
                      usedSourceUrls={usedSourceUrls}
                      allowedSourceHosts={allowedSourceHosts}
                      sourceUrlOrigin={sourceUrlOrigin}
                      editingRedirect={row}
                      disclosure={
                        <ButtonQuickAction
                          icon={CapUIIcon.Pencil}
                          size={CapUIIconSize.Md}
                          variantColor="hierarchy"
                          label={intl.formatMessage({ id: 'global.edit' })}
                        />
                      }
                    />
                  )}
                  <DeleteRedirectModal
                    connectionId={connectionId}
                    redirect={row}
                    disclosure={
                      <ButtonQuickAction
                        icon={CapUIIcon.Trash}
                        size={CapUIIconSize.Md}
                        variantColor="danger"
                        label={intl.formatMessage({ id: 'global.delete' })}
                      />
                    }
                  />
                </Flex>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      {hasNext && (
        <Flex justify="center" mt={4}>
          <Button
            variant="tertiary"
            variantColor="primary"
            onClick={() => loadNext(REDIRECTS_PAGINATION_COUNT)}
            isLoading={isLoadingNext}
          >
            {intl.formatMessage({ id: 'global.more' })}
          </Button>
        </Flex>
      )}
    </Box>
  )
}

export const getServerSideProps = withPageAuthRequired

export default CustomRedirection
