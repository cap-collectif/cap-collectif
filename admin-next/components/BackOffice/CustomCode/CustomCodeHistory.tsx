import { Box, Button, CapUIFontSize, CapUIFontWeight, Flex, Heading, Tag, Text, Tooltip } from '@cap-collectif/ui'
import { FC } from 'react'
import { useIntl } from 'react-intl'
import { Version } from './customCodeVersioning.types'

type CustomCodeHistoryProps = {
  hasMoreVersions: boolean
  isLoadingMoreVersions: boolean
  previousVersions: readonly Version[]
  previousVersionsCount: number
  onLoadMore: () => void
  onOpenDiff: (version: Version) => void
  onOpenRestore: (version: Version) => void
  onOpenView: (version: Version) => void
}

export const CustomCodeHistory: FC<CustomCodeHistoryProps> = ({
  hasMoreVersions,
  isLoadingMoreVersions,
  previousVersions,
  previousVersionsCount,
  onLoadMore,
  onOpenDiff,
  onOpenRestore,
  onOpenView,
}) => {
  const intl = useIntl()

  return (
    <Box bg="white" borderRadius="8px" p={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Heading as="h4" color="blue.800" fontWeight={600} mb={1}>
            {intl.formatMessage({ id: 'admin.custom-code.history-title' })}
          </Heading>
        </Box>
        <Tag variantColor="infoGray">
          <Tag.Label>
            {intl.formatMessage(
              { id: 'admin.custom-code.previous-versions-count' },
              { loaded: previousVersions.length, total: previousVersionsCount },
            )}
          </Tag.Label>
        </Tag>
      </Flex>

      {previousVersions.length ? (
        <Flex direction="column" spacing={3}>
          {previousVersions.map(version => (
            <Box key={version.id} border="1px solid" borderColor="gray.200" borderRadius="8px" p={4}>
              <Flex justify="space-between" align="flex-start" gap={4}>
                <Box minWidth={0}>
                  <Flex align="center" gap={2} mb={1} wrap="wrap">
                    <Text color="gray.900" fontWeight={CapUIFontWeight.Semibold}>
                      {version.title}
                    </Text>
                    <Tag variantColor={version.type === 'RESTORE' ? 'warning' : 'infoGray'}>
                      <Tag.Label>{version.type}</Tag.Label>
                    </Tag>
                  </Flex>
                  <Text color="gray.700" fontSize={CapUIFontSize.BodySmall}>
                    {version.authorName} - {new Date(version.createdAt).toLocaleString('fr-FR')}
                  </Text>
                  {version.description ? (
                    <Text color="gray.700" fontSize={CapUIFontSize.BodySmall} mt={2}>
                      {version.description}
                    </Text>
                  ) : null}
                  {version.referenceUrl ? (
                    <Button as="a" href={version.referenceUrl} target="_blank" variant="link" mt={2}>
                      {intl.formatMessage({ id: 'admin.custom-code.reference-url' })}
                    </Button>
                  ) : null}
                </Box>
                <Flex gap={2} flexShrink={0}>
                  <Tooltip label={intl.formatMessage({ id: 'admin.custom-code.tooltip-view-content' })}>
                    <Button variant="secondary" variantColor="hierarchy" onClick={() => onOpenView(version)}>
                      {intl.formatMessage({ id: 'admin.general.content' })}
                    </Button>
                  </Tooltip>
                  <Tooltip label={intl.formatMessage({ id: 'admin.custom-code.tooltip-version-diff' })}>
                    <Button variant="secondary" variantColor="primary" onClick={() => onOpenDiff(version)}>
                      {intl.formatMessage({ id: 'admin.custom-code.diff' })}
                    </Button>
                  </Tooltip>
                  <Tooltip label={intl.formatMessage({ id: 'admin.custom-code.tooltip-restore' })}>
                    <Button variant="secondary" variantColor="primary" onClick={() => onOpenRestore(version)}>
                      {intl.formatMessage({ id: 'admin.custom-code.restore' })}
                    </Button>
                  </Tooltip>
                </Flex>
              </Flex>
            </Box>
          ))}
          {hasMoreVersions ? (
            <Flex justify="center" mt={2}>
              <Button
                type="button"
                variant="secondary"
                variantColor="primary"
                isLoading={isLoadingMoreVersions}
                onClick={onLoadMore}
              >
                {intl.formatMessage({ id: 'global.more' })}
              </Button>
            </Flex>
          ) : null}
        </Flex>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          border="1px dashed"
          borderColor="gray.300"
          borderRadius="8px"
          py={12}
          px={6}
          textAlign="center"
          spacing={2}
        >
          <Text color="gray.900" fontWeight={CapUIFontWeight.Semibold}>
            {intl.formatMessage({ id: 'admin.custom-code.no-previous-version-title' })}
          </Text>
          <Text color="gray.700" maxWidth="620px">
            {intl.formatMessage({ id: 'admin.custom-code.no-previous-version-description' })}
          </Text>
        </Flex>
      )}
    </Box>
  )
}
